import { categorizeBatch, type CategorizeInput } from './_shared/categorize.ts'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const transactions = (body?.transactions ?? []) as CategorizeInput[]
    const results = await categorizeBatch(transactions)
    res.status(200).json({ results })
  } catch (err) {
    console.error('[api/categorize]', err)
    res.status(500).json({ error: 'categorization_failed' })
  }
}
