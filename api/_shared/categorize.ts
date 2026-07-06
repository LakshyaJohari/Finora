import { callGroq } from './groqClient.ts'

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']

export interface CategorizeInput {
  id: string
  merchant: string | null
  description: string | null
  amount: number
}

export interface CategorizeResult {
  id: string
  category: string
  reasoning: string
}

export async function categorizeBatch(transactions: CategorizeInput[]): Promise<CategorizeResult[]> {
  if (transactions.length === 0) return []

  const list = transactions
    .map(
      (t, i) =>
        `${i}. id=${t.id} merchant="${t.merchant ?? ''}" description="${t.description ?? ''}" amount=${t.amount}`,
    )
    .join('\n')

  const prompt = `You are categorizing personal finance transactions into exactly one of these categories: ${CATEGORIES.join(', ')}.

For each transaction below, choose the single best category and write a one-sentence reasoning for the choice.

Transactions:
${list}

Respond with ONLY a JSON object of this exact shape, one entry per transaction, in the same order:
{"results": [{"id": "<id>", "category": "<one of the categories>", "reasoning": "<one sentence>"}]}`

  const content = await callGroq(
    [
      { role: 'system', content: 'You are a precise financial transaction categorizer. Always respond with valid JSON only, no other text.' },
      { role: 'user', content: prompt },
    ],
    { model: 'llama-3.1-8b-instant', jsonMode: true, temperature: 0.2 },
  )

  const parsed = JSON.parse(content)
  const results: CategorizeResult[] = Array.isArray(parsed?.results) ? parsed.results : []
  const byId = new Map(results.map((r) => [r.id, r]))

  // Guard against the model inventing categories or dropping/reordering rows.
  return transactions.map((t) => {
    const match = byId.get(t.id)
    const category = match && CATEGORIES.includes(match.category) ? match.category : 'Other'
    return { id: t.id, category, reasoning: match?.reasoning ?? '' }
  })
}
