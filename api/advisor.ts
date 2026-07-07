import { getAdvisorReply, type AdvisorChatMessage } from './_shared/advisor.ts'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const context = String(body?.context ?? '')
    const history = (body?.history ?? []) as AdvisorChatMessage[]
    const message = String(body?.message ?? '')
    if (!message.trim()) {
      res.status(400).json({ error: 'empty_message' })
      return
    }
    const reply = await getAdvisorReply(context, history, message)
    res.status(200).json({ reply })
  } catch (err) {
    console.error('[api/advisor]', err)
    res.status(500).json({ error: 'advisor_failed' })
  }
}
