export interface AdvisorHistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Calls our server-side /api/advisor proxy. Returns null on any failure so
 * the UI can show a graceful notice instead of a broken conversation.
 */
export async function fetchAdvisorReply(
  context: string,
  history: AdvisorHistoryMessage[],
  message: string,
): Promise<string | null> {
  try {
    const res = await fetch('/api/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context, history, message }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.reply === 'string' ? data.reply : null
  } catch {
    return null
  }
}
