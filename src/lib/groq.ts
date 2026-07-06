export interface CategorizeRequestItem {
  id: string
  merchant: string | null
  description: string | null
  amount: number
}

export interface CategorizeResultItem {
  id: string
  category: string
  reasoning: string
}

/**
 * Calls our server-side /api/categorize proxy (never Groq directly - the
 * API key must stay off the client). Returns null on any failure so callers
 * can fall back gracefully instead of blocking on an LLM outage.
 */
export async function categorizeTransactions(
  items: CategorizeRequestItem[],
): Promise<CategorizeResultItem[] | null> {
  if (items.length === 0) return []
  try {
    const res = await fetch('/api/categorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: items }),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data.results)) return null
    return data.results as CategorizeResultItem[]
  } catch {
    return null
  }
}
