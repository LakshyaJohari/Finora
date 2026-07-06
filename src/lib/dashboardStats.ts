import type { Transaction } from '../types'

export interface DashboardStats {
  totalTracked: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number | null
}

function isSameMonth(dateStr: string, ref: Date) {
  const d = new Date(dateStr)
  return d.getUTCFullYear() === ref.getUTCFullYear() && d.getUTCMonth() === ref.getUTCMonth()
}

export function computeStats(transactions: Transaction[], now = new Date()): DashboardStats {
  const totalTracked = transactions.reduce((sum, t) => sum + t.amount, 0)

  const thisMonth = transactions.filter((t) => isSameMonth(t.transaction_date, now))
  const monthlyIncome = thisMonth.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = Math.abs(
    thisMonth.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0),
  )
  const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : null

  return { totalTracked, monthlyIncome, monthlyExpenses, savingsRate }
}

export interface CashFlowPoint {
  weekStart: string
  income: number
  expenses: number
}

/** Buckets the last 3 months of activity into weekly income/expense totals. */
export function computeCashFlow(transactions: Transaction[], now = new Date()): CashFlowPoint[] {
  const start = new Date(now)
  start.setUTCMonth(start.getUTCMonth() - 3)

  const buckets = new Map<string, { income: number; expenses: number }>()
  const cursor = new Date(start)
  cursor.setUTCDate(cursor.getUTCDate() - cursor.getUTCDay())
  while (cursor <= now) {
    buckets.set(cursor.toISOString().slice(0, 10), { income: 0, expenses: 0 })
    cursor.setUTCDate(cursor.getUTCDate() + 7)
  }

  for (const t of transactions) {
    const d = new Date(t.transaction_date)
    if (d < start || d > now) continue
    const weekStart = new Date(d)
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay())
    const key = weekStart.toISOString().slice(0, 10)
    const bucket = buckets.get(key)
    if (!bucket) continue
    if (t.amount > 0) bucket.income += t.amount
    else bucket.expenses += Math.abs(t.amount)
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, v]) => ({ weekStart, ...v }))
}

export interface CategorySlice {
  category: string
  amount: number
}

export function computeCategoryBreakdown(transactions: Transaction[], now = new Date()): CategorySlice[] {
  const thisMonth = transactions.filter((t) => t.amount < 0 && isSameMonth(t.transaction_date, now))
  const totals = new Map<string, number>()
  for (const t of thisMonth) {
    totals.set(t.category, (totals.get(t.category) ?? 0) + Math.abs(t.amount))
  }
  return Array.from(totals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export interface TopCategoryInsight {
  category: string
  thisMonth: number
  threeMonthAverage: number
  percentDelta: number
}

/**
 * Compares this month's biggest spending category against that same
 * category's average over the trailing 3 months (excluding this month).
 * Real numbers only - no LLM guessing involved.
 */
export function computeTopCategoryInsight(transactions: Transaction[], now = new Date()): TopCategoryInsight | null {
  const breakdown = computeCategoryBreakdown(transactions, now)
  if (breakdown.length === 0) return null
  const top = breakdown[0]

  const priorStart = new Date(now)
  priorStart.setUTCMonth(priorStart.getUTCMonth() - 3)
  const priorMonths = new Set<string>()
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now)
    d.setUTCMonth(d.getUTCMonth() - i)
    priorMonths.add(`${d.getUTCFullYear()}-${d.getUTCMonth()}`)
  }

  const priorTotals = new Map<string, number>()
  for (const t of transactions) {
    if (t.amount >= 0 || t.category !== top.category) continue
    const d = new Date(t.transaction_date)
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`
    if (!priorMonths.has(key)) continue
    priorTotals.set(key, (priorTotals.get(key) ?? 0) + Math.abs(t.amount))
  }

  const monthsWithData = Math.max(priorTotals.size, 1)
  const priorSum = Array.from(priorTotals.values()).reduce((s, v) => s + v, 0)
  const threeMonthAverage = priorSum / monthsWithData

  const percentDelta = threeMonthAverage > 0 ? ((top.amount - threeMonthAverage) / threeMonthAverage) * 100 : 0

  return { category: top.category, thisMonth: top.amount, threeMonthAverage, percentDelta }
}
