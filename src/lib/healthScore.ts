import type { Goal, Transaction } from '../types'

export const HEALTH_SCORE_WEIGHTS = {
  savingsRate: 0.25,
  spendingConsistency: 0.15,
  emergencyFund: 0.2,
  recurringObligationRatio: 0.15,
  goalProgress: 0.25,
} as const

export type HealthScoreComponentKey = keyof typeof HEALTH_SCORE_WEIGHTS

export interface HealthScoreComponent {
  key: HealthScoreComponentKey
  label: string
  score: number | null
  weight: number
  explanation: string
}

export interface HealthScoreResult {
  score: number | null
  components: HealthScoreComponent[]
}

function monthKey(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`
}

function monthsAgoKey(now: Date, monthsAgo: number) {
  const d = new Date(now)
  d.setUTCMonth(d.getUTCMonth() - monthsAgo)
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}`
}

function monthlyTotals(transactions: Transaction[]) {
  const income = new Map<string, number>()
  const expenses = new Map<string, number>()
  for (const t of transactions) {
    const key = monthKey(t.transaction_date)
    if (t.amount > 0) income.set(key, (income.get(key) ?? 0) + t.amount)
    else expenses.set(key, (expenses.get(key) ?? 0) + Math.abs(t.amount))
  }
  return { income, expenses }
}

function average(values: number[]) {
  if (values.length === 0) return null
  return values.reduce((s, v) => s + v, 0) / values.length
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n))
}

function computeSavingsRateComponent(transactions: Transaction[], now: Date): HealthScoreComponent {
  const { income, expenses } = monthlyTotals(transactions)
  const rates: number[] = []
  for (let i = 0; i < 3; i++) {
    const key = monthsAgoKey(now, i)
    const inc = income.get(key)
    if (!inc) continue
    const exp = expenses.get(key) ?? 0
    rates.push((inc - exp) / inc)
  }
  const avgRate = average(rates)
  if (avgRate == null) {
    return {
      key: 'savingsRate',
      label: 'Savings rate',
      score: null,
      weight: HEALTH_SCORE_WEIGHTS.savingsRate,
      explanation: 'Log some income transactions to see this.',
    }
  }
  const score = clamp(avgRate * 100 * 2.5) // 40% savings rate reaches a full 100 score
  return {
    key: 'savingsRate',
    label: 'Savings rate',
    score,
    weight: HEALTH_SCORE_WEIGHTS.savingsRate,
    explanation: `You're saving about ${Math.round(avgRate * 100)}% of your income on average.`,
  }
}

function computeSpendingConsistencyComponent(transactions: Transaction[], now: Date): HealthScoreComponent {
  const { expenses } = monthlyTotals(transactions)
  const thisMonth = expenses.get(monthsAgoKey(now, 0)) ?? 0
  const priorMonths = [1, 2, 3].map((m) => expenses.get(monthsAgoKey(now, m))).filter((v): v is number => v != null)

  if (priorMonths.length === 0 || thisMonth === 0) {
    return {
      key: 'spendingConsistency',
      label: 'Spending consistency',
      score: null,
      weight: HEALTH_SCORE_WEIGHTS.spendingConsistency,
      explanation: 'Track a couple more months to see this.',
    }
  }

  const avgPrior = average(priorMonths)!
  const percentDeviation = avgPrior > 0 ? Math.abs(thisMonth - avgPrior) / avgPrior : 0
  const score = clamp(100 - percentDeviation * 100)
  const direction = thisMonth > avgPrior ? 'higher' : thisMonth < avgPrior ? 'lower' : 'in line with'
  return {
    key: 'spendingConsistency',
    label: 'Spending consistency',
    score,
    weight: HEALTH_SCORE_WEIGHTS.spendingConsistency,
    explanation: `This month's spending is ${direction} your recent average.`,
  }
}

function computeEmergencyFundComponent(transactions: Transaction[], goals: Goal[], now: Date): HealthScoreComponent {
  const emergencyGoals = goals.filter((g) => g.category === 'Emergency Fund')
  const { expenses } = monthlyTotals(transactions)
  const recentExpenses = [0, 1, 2].map((m) => expenses.get(monthsAgoKey(now, m)) ?? 0)
  const avgMonthlyExpense = average(recentExpenses.filter((v) => v > 0))

  if (emergencyGoals.length === 0 || avgMonthlyExpense == null) {
    return {
      key: 'emergencyFund',
      label: 'Emergency fund coverage',
      score: null,
      weight: HEALTH_SCORE_WEIGHTS.emergencyFund,
      explanation:
        emergencyGoals.length === 0
          ? 'Create an Emergency Fund goal to see this.'
          : 'Log a few expenses to estimate your target.',
    }
  }

  const saved = emergencyGoals.reduce((sum, g) => sum + g.current_amount, 0)
  const target = avgMonthlyExpense * 3
  const coverage = target > 0 ? saved / target : 1
  const score = clamp(coverage * 100)
  return {
    key: 'emergencyFund',
    label: 'Emergency fund coverage',
    score,
    weight: HEALTH_SCORE_WEIGHTS.emergencyFund,
    explanation: `Your Emergency Fund covers about ${Math.round(coverage * 100)}% of 3 months of expenses.`,
  }
}

function computeRecurringObligationComponent(transactions: Transaction[], now: Date): HealthScoreComponent {
  const { income } = monthlyTotals(transactions)
  const incomeValues = [0, 1, 2].map((m) => income.get(monthsAgoKey(now, m))).filter((v): v is number => v != null)
  const avgIncome = average(incomeValues)

  if (avgIncome == null) {
    return {
      key: 'recurringObligationRatio',
      label: 'Recurring obligations',
      score: null,
      weight: HEALTH_SCORE_WEIGHTS.recurringObligationRatio,
      explanation: 'Log some income transactions to see this.',
    }
  }

  const recurringMonthly = transactions
    .filter((t) => t.is_recurring && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const ratio = avgIncome > 0 ? recurringMonthly / avgIncome : 0
  // 10% of income in recurring charges is very healthy, 50%+ is a strain.
  const score = clamp(100 - ((ratio - 0.1) / 0.4) * 100)
  return {
    key: 'recurringObligationRatio',
    label: 'Recurring obligations',
    score,
    weight: HEALTH_SCORE_WEIGHTS.recurringObligationRatio,
    explanation: `Recurring charges use about ${Math.round(ratio * 100)}% of your average monthly income.`,
  }
}

function computeGoalProgressComponent(goals: Goal[]): HealthScoreComponent {
  if (goals.length === 0) {
    return {
      key: 'goalProgress',
      label: 'Goal progress',
      score: null,
      weight: HEALTH_SCORE_WEIGHTS.goalProgress,
      explanation: 'Create a goal to see this.',
    }
  }
  const progresses = goals.map((g) => (g.target_amount > 0 ? clamp((g.current_amount / g.target_amount) * 100) : 0))
  const avgProgress = average(progresses)!
  return {
    key: 'goalProgress',
    label: 'Goal progress',
    score: avgProgress,
    weight: HEALTH_SCORE_WEIGHTS.goalProgress,
    explanation: `You're averaging ${Math.round(avgProgress)}% progress across your goals.`,
  }
}

/**
 * Weighted 0-100 score. Components with no usable data are excluded and the
 * remaining weights are redistributed proportionally (rather than treating
 * missing data as a 0), so a brand-new account isn't unfairly penalized.
 */
export function computeHealthScore(
  transactions: Transaction[],
  goals: Goal[],
  now: Date = new Date(),
): HealthScoreResult {
  const components = [
    computeSavingsRateComponent(transactions, now),
    computeSpendingConsistencyComponent(transactions, now),
    computeEmergencyFundComponent(transactions, goals, now),
    computeRecurringObligationComponent(transactions, now),
    computeGoalProgressComponent(goals),
  ]

  const available = components.filter((c) => c.score != null)
  if (available.length === 0) return { score: null, components }

  const totalWeight = available.reduce((sum, c) => sum + c.weight, 0)
  const weightedSum = available.reduce((sum, c) => sum + (c.score as number) * c.weight, 0)
  const score = Math.round(weightedSum / totalWeight)

  return { score, components }
}
