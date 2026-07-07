import type { Goal, Transaction } from '../types'

function monthKey(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`
}

function monthsAgoKey(now: Date, monthsAgo: number) {
  const d = new Date(now)
  d.setUTCMonth(d.getUTCMonth() - monthsAgo)
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`
}

/** Average monthly (income - expenses) over the trailing N months that have any activity. */
export function computeAverageMonthlySavings(transactions: Transaction[], now: Date = new Date(), monthsBack = 3) {
  const totals = new Map<string, number>()
  for (const t of transactions) {
    const key = monthKey(t.transaction_date)
    totals.set(key, (totals.get(key) ?? 0) + t.amount)
  }
  const recentKeys = Array.from({ length: monthsBack }, (_, i) => monthsAgoKey(now, i))
  const values = recentKeys.map((k) => totals.get(k)).filter((v): v is number => v != null)
  if (values.length === 0) return null
  return values.reduce((s, v) => s + v, 0) / values.length
}

export type GoalStatus = 'achieved' | 'on-track' | 'needs-adjustment' | 'at-risk' | 'unknown'

export interface GoalProjection {
  remaining: number
  monthsUntilTargetDate: number | null
  requiredMonthlySavings: number | null
  projectedCompletionDate: string | null
  status: GoalStatus
}

/**
 * Honest heuristic, not a real statistical model: buckets progress into
 * on-track / needs-adjustment / at-risk by comparing what the user is
 * actually saving to what the goal's target date requires.
 */
export function computeGoalProjection(
  goal: Goal,
  avgMonthlySavings: number | null,
  now: Date = new Date(),
): GoalProjection {
  const remaining = Math.max(0, goal.target_amount - goal.current_amount)

  if (remaining === 0) {
    return {
      remaining: 0,
      monthsUntilTargetDate: null,
      requiredMonthlySavings: 0,
      projectedCompletionDate: null,
      status: 'achieved',
    }
  }

  let monthsUntilTargetDate: number | null = null
  let requiredMonthlySavings: number | null = null
  if (goal.target_date) {
    const target = new Date(goal.target_date)
    monthsUntilTargetDate = Math.max(
      0,
      (target.getUTCFullYear() - now.getUTCFullYear()) * 12 + (target.getUTCMonth() - now.getUTCMonth()),
    )
    requiredMonthlySavings = monthsUntilTargetDate > 0 ? remaining / monthsUntilTargetDate : remaining
  }

  let projectedCompletionDate: string | null = null
  if (avgMonthlySavings != null && avgMonthlySavings > 0) {
    const monthsNeeded = Math.ceil(remaining / avgMonthlySavings)
    const projected = new Date(now)
    projected.setUTCMonth(projected.getUTCMonth() + monthsNeeded)
    projectedCompletionDate = projected.toISOString().slice(0, 10)
  }

  let status: GoalStatus
  if (avgMonthlySavings == null) {
    status = 'unknown'
  } else if (requiredMonthlySavings == null) {
    status = avgMonthlySavings > 0 ? 'on-track' : 'at-risk'
  } else if (avgMonthlySavings <= 0) {
    status = 'at-risk'
  } else {
    const ratio = avgMonthlySavings / requiredMonthlySavings
    if (ratio >= 1) status = 'on-track'
    else if (ratio >= 0.6) status = 'needs-adjustment'
    else status = 'at-risk'
  }

  return { remaining, monthsUntilTargetDate, requiredMonthlySavings, projectedCompletionDate, status }
}

const STATUS_LABEL: Record<GoalStatus, string> = {
  achieved: 'Achieved',
  'on-track': 'On track',
  'needs-adjustment': 'Needs adjustment',
  'at-risk': 'At risk',
  unknown: 'Not enough data yet',
}

export function goalStatusLabel(status: GoalStatus) {
  return STATUS_LABEL[status]
}

/** Deterministic, no LLM - a single plain-language suggestion line. */
export function goalSuggestion(goal: Goal, projection: GoalProjection, avgMonthlySavings: number | null): string {
  if (projection.status === 'achieved') return "You've hit this goal already - nice work."
  if (avgMonthlySavings == null) return 'Log a few months of transactions to get a personalized suggestion here.'
  if (!goal.target_date) return 'Add a target date to see a pace estimate for this goal.'

  const currency = (n: number) => Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  if (projection.status === 'on-track') {
    return `You're on pace to hit this goal by your target date at your current savings rate.`
  }

  if (projection.requiredMonthlySavings == null) return 'Not enough data yet to estimate a monthly target.'

  const gap = projection.requiredMonthlySavings - (avgMonthlySavings ?? 0)
  return `Save ${currency(gap)} more per month to hit your target date on time.`
}
