import { callGroq } from './groqClient.ts'

// Groq's current vision-capable chat model. Multimodal model availability on
// Groq shifts fairly often - if this starts failing, check
// console.groq.com/docs/models for the current vision model name.
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

export interface ExtractedRow {
  date: string | null
  description: string | null
  amount: number | null
}

export async function extractTransactionsFromImage(imageDataUrl: string, todayIso: string): Promise<ExtractedRow[]> {
  const prompt = `You are extracting financial transactions from an image. It may be a single
receipt (one purchase) or a screenshot of a bank/card statement (multiple rows).

For each transaction you find, return:
- date: the transaction date as YYYY-MM-DD. If the year isn't visible, infer it using today's
  date (${todayIso}) as a reference, picking the most recent plausible date that isn't in the
  future.
- description: the merchant name or a short description of the transaction.
- amount: a signed number - negative for a purchase/payment/debit, positive for a deposit/credit/
  refund. For a receipt, this is the total amount paid (negative).

If you can't confidently read a field for a given row, use null for that field rather than
guessing. If the image contains no readable transactions at all, return an empty array.

Respond with ONLY a JSON object of this exact shape:
{"transactions": [{"date": "YYYY-MM-DD" or null, "description": string or null, "amount": number or null}]}`

  const content = await callGroq(
    [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      },
    ],
    { model: VISION_MODEL, jsonMode: true, temperature: 0.1, timeoutMs: 30000 },
  )

  const parsed = JSON.parse(content)
  const rows = Array.isArray(parsed?.transactions) ? parsed.transactions : []

  return rows.map((r: unknown) => {
    const row = r as Record<string, unknown>
    return {
      date: typeof row.date === 'string' ? row.date : null,
      description: typeof row.description === 'string' ? row.description : null,
      amount: typeof row.amount === 'number' ? row.amount : null,
    }
  })
}
