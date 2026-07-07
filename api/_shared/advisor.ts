import { callGroq } from './groqClient.ts'

export interface AdvisorChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const MAX_HISTORY = 10

const SYSTEM_PROMPT = `You are Finora's financial advisor for this one user. You will be given a snapshot of
their real financial data - use ONLY that data to ground any numeric claim you make (spending
amounts, savings rate, goal progress, health score, etc). Never invent or estimate a figure that
isn't in the provided data. If answering well would require a number that isn't in the snapshot
(e.g. a purchase price the user didn't mention, or an expense category with no history), ask a
short clarifying question instead of guessing.

Be concise, warm, and practical - a few sentences, not an essay. When you cite a number from the
data, state it plainly (e.g. "your savings rate is 27%").`

/**
 * Grounded chat reply: system prompt + a compact real-data context +
 * capped recent history + the new message. Model choice is the larger
 * Groq model since this needs more reasoning than batch categorization.
 */
export async function getAdvisorReply(context: string, history: AdvisorChatMessage[], userMessage: string): Promise<string> {
  const recentHistory = history.slice(-MAX_HISTORY)

  const messages = [
    { role: 'system' as const, content: `${SYSTEM_PROMPT}\n\nUser's financial snapshot:\n${context}` },
    ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: userMessage },
  ]

  return callGroq(messages, { model: 'llama-3.3-70b-versatile', temperature: 0.4, timeoutMs: 20000 })
}
