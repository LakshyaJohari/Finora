import type { Goal, Transaction } from '../types'
import { computeStats, computeCategoryBreakdown, computeTopCategoryInsight } from './dashboardStats'
import { computeHealthScore } from './healthScore'
import { detectRecurring } from './recurring'
import { computeAverageMonthlySavings, computeGoalProjection, goalStatusLabel } from './goalProjection'
import { computeMonthlyHistory, computeYearlyHistory } from './history'

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const RECENT_MONTHS_DETAIL = 12

/**
 * Assembles a compact, structured summary of the user's real financial
 * state to ground the advisor's answers - not a raw data dump. Token
 * efficiency matters here since this gets sent on every chat request.
 */
export function buildAdvisorContext(transactions: Transaction[], goals: Goal[], now: Date = new Date()): string {
  const stats = computeStats(transactions, now)
  const categoryBreakdown = computeCategoryBreakdown(transactions, now)
  const health = computeHealthScore(transactions, goals, now)
  const recurring = detectRecurring(transactions)
  const avgSavings = computeAverageMonthlySavings(transactions, now)

  const lines: string[] = []

  lines.push(`Today's date: ${now.toISOString().slice(0, 10)}.`)
  lines.push(
    `This month: income ${fmt(stats.monthlyIncome)}, expenses ${fmt(stats.monthlyExpenses)}, savings rate ${
      stats.savingsRate != null ? `${Math.round(stats.savingsRate * 100)}%` : 'unknown (no income logged yet)'
    }.`,
  )
  lines.push(`Recent average monthly savings (income minus expenses): ${avgSavings != null ? fmt(avgSavings) : 'unknown'}.`)
  lines.push(`Total tracked (all-time income minus expenses): ${fmt(stats.totalTracked)}.`)

  if (categoryBreakdown.length > 0) {
    lines.push(`Spending by category this month: ${categoryBreakdown.map((c) => `${c.category} ${fmt(c.amount)}`).join(', ')}.`)
  } else {
    lines.push('No spending logged yet this month.')
  }

  // Full history, not just a recent window: detailed months up to a cap (keeps
  // token count bounded for long-tenured accounts), plus yearly totals so
  // older activity - like a big one-off transaction from years back - is
  // still visible to the advisor even once it ages out of the monthly detail.
  const monthlyHistory = computeMonthlyHistory(transactions)
  if (monthlyHistory.length > 0) {
    const recentDetail = monthlyHistory.slice(0, RECENT_MONTHS_DETAIL)
    lines.push(
      `Monthly history, most recent first (income / expenses / net): ${recentDetail
        .map((m) => `${m.label}: ${fmt(m.income)} / ${fmt(m.expenses)} / ${fmt(m.net)}`)
        .join('; ')}.`,
    )
  }

  const yearlyHistory = computeYearlyHistory(transactions)
  if (yearlyHistory.length > 1) {
    lines.push(
      `Yearly totals across all recorded history (income / expenses / net): ${yearlyHistory
        .map((y) => `${y.year}: ${fmt(y.income)} / ${fmt(y.expenses)} / ${fmt(y.net)}`)
        .join('; ')}.`,
    )
  }

  const topCategoryInsight = computeTopCategoryInsight(transactions, now)
  if (topCategoryInsight && topCategoryInsight.threeMonthAverage > 0) {
    const direction = topCategoryInsight.percentDelta >= 0 ? 'up' : 'down'
    lines.push(
      `Biggest category this month is ${topCategoryInsight.category} at ${fmt(topCategoryInsight.thisMonth)}, ${direction} ${Math.abs(Math.round(topCategoryInsight.percentDelta))}% vs its 3-month average of ${fmt(topCategoryInsight.threeMonthAverage)}.`,
    )
  }

  if (goals.length > 0) {
    const goalLines = goals.map((g) => {
      const projection = computeGoalProjection(g, avgSavings, now)
      const pct = Math.round((g.current_amount / g.target_amount) * 100)
      const dateStr = g.target_date ? `, target date ${g.target_date}` : ''
      const requiredStr =
        projection.requiredMonthlySavings != null
          ? `, needs ${fmt(projection.requiredMonthlySavings)}/month to hit the target date`
          : ''
      const projectedStr = projection.projectedCompletionDate
        ? `, projected to finish around ${projection.projectedCompletionDate} at the current savings pace`
        : ''
      return `${g.name} (${g.category ?? 'uncategorized'}): ${fmt(g.current_amount)} of ${fmt(g.target_amount)} (${pct}%)${dateStr}, status ${goalStatusLabel(projection.status)}${requiredStr}${projectedStr}`
    })
    lines.push(`Goals: ${goalLines.join('; ')}.`)
  } else {
    lines.push('No goals set yet.')
  }

  if (recurring.length > 0) {
    lines.push(`Recurring subscriptions: ${recurring.map((r) => `${r.label} ${fmt(r.averageAmount)}/mo`).join(', ')}.`)
  }

  lines.push(`Financial health score: ${health.score != null ? `${health.score}/100` : 'not enough data yet'}.`)

  return lines.join('\n')
}
