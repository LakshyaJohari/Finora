import { extractTransactionsFromImage } from './_shared/extract.ts'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const image = String(body?.image ?? '')
    const today = String(body?.today ?? new Date().toISOString().slice(0, 10))
    if (!image) {
      res.status(400).json({ error: 'missing_image' })
      return
    }
    const transactions = await extractTransactionsFromImage(image, today)
    res.status(200).json({ transactions })
  } catch (err) {
    console.error('[api/extract]', err)
    res.status(500).json({ error: 'extract_failed' })
  }
}
