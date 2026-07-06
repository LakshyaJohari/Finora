import type { Transaction } from '../types'

export interface RecurringGroup {
  key: string
  label: string
  averageAmount: number
  transactionIds: string[]
}

const AMOUNT_TOLERANCE = 0.05
const MIN_INTERVAL_DAYS = 20
const MAX_INTERVAL_DAYS = 40
const MS_PER_DAY = 1000 * 60 * 60 * 24

/**
 * Deterministic (non-LLM) recurring/subscription detection: groups expenses
 * by merchant, then flags a group as recurring when its amounts stay within
 * ~5% of each other and consecutive charges land roughly a month apart.
 */
export function detectRecurring(transactions: Transaction[]): RecurringGroup[] {
  const groups = new Map<string, Transaction[]>()

  for (const t of transactions) {
    if (t.amount >= 0) continue // only expenses can be subscriptions
    const key = (t.merchant || t.description || '').trim().toLowerCase()
    if (!key) continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(t)
  }

  const results: RecurringGroup[] = []

  for (const [key, txs] of groups) {
    if (txs.length < 2) continue
    const sorted = [...txs].sort((a, b) => a.transaction_date.localeCompare(b.transaction_date))
    const amounts = sorted.map((t) => Math.abs(t.amount))
    const avg = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
    const withinTolerance = amounts.every((a) => Math.abs(a - avg) / avg <= AMOUNT_TOLERANCE)
    if (!withinTolerance) continue

    const dates = sorted.map((t) => new Date(t.transaction_date).getTime())
    const gapsInDays = dates.slice(1).map((d, i) => (d - dates[i]) / MS_PER_DAY)
    const roughlyMonthly = gapsInDays.every((g) => g >= MIN_INTERVAL_DAYS && g <= MAX_INTERVAL_DAYS)
    if (!roughlyMonthly) continue

    results.push({
      key,
      label: sorted[0].merchant || sorted[0].description || key,
      averageAmount: avg,
      transactionIds: sorted.map((t) => t.id),
    })
  }

  return results.sort((a, b) => b.averageAmount - a.averageAmount)
}
