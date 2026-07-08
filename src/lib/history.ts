import type { Transaction } from '../types'

export interface MonthlySummary {
  key: string // "2020-06"
  label: string // "Jun 2020"
  income: number
  expenses: number
  net: number
}

/** One row per month that has any activity at all, most recent first - not capped to a recent window. */
export function computeMonthlyHistory(transactions: Transaction[]): MonthlySummary[] {
  const totals = new Map<string, { income: number; expenses: number }>()
  for (const t of transactions) {
    const d = new Date(t.transaction_date)
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    const bucket = totals.get(key) ?? { income: 0, expenses: 0 }
    if (t.amount > 0) bucket.income += t.amount
    else bucket.expenses += Math.abs(t.amount)
    totals.set(key, bucket)
  }

  return Array.from(totals.entries())
    .map(([key, v]) => {
      const [y, m] = key.split('-').map(Number)
      const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      return { key, label, income: v.income, expenses: v.expenses, net: v.income - v.expenses }
    })
    .sort((a, b) => b.key.localeCompare(a.key))
}

export interface YearlySummary {
  year: number
  income: number
  expenses: number
  net: number
}

/** One row per calendar year that has any activity, most recent first. */
export function computeYearlyHistory(transactions: Transaction[]): YearlySummary[] {
  const totals = new Map<number, { income: number; expenses: number }>()
  for (const t of transactions) {
    const year = new Date(t.transaction_date).getUTCFullYear()
    const bucket = totals.get(year) ?? { income: 0, expenses: 0 }
    if (t.amount > 0) bucket.income += t.amount
    else bucket.expenses += Math.abs(t.amount)
    totals.set(year, bucket)
  }

  return Array.from(totals.entries())
    .map(([year, v]) => ({ year, income: v.income, expenses: v.expenses, net: v.income - v.expenses }))
    .sort((a, b) => b.year - a.year)
}
