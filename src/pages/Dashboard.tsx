import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Receipt } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTransactions } from '../hooks/useTransactions'
import { useGoals } from '../hooks/useGoals'
import {
  computeCashFlow,
  computeCategoryBreakdown,
  computeStats,
  computeTopCategoryInsight,
} from '../lib/dashboardStats'
import { computeHealthScore } from '../lib/healthScore'
import { HealthScoreCard } from '../components/HealthScoreCard'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const CATEGORY_COLORS = ['#2A7F7B', '#E8A24C', '#3F9C97', '#9CA8A4', '#C4604A', '#1E5F5C', '#5C6B67']

const SPARSE_THRESHOLD = 5

export default function Dashboard() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const { transactions, loading } = useTransactions()
  const { goals } = useGoals()
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0]

  const stats = useMemo(() => computeStats(transactions), [transactions])
  const cashFlow = useMemo(() => computeCashFlow(transactions), [transactions])
  const categoryBreakdown = useMemo(() => computeCategoryBreakdown(transactions), [transactions])
  const insight = useMemo(() => computeTopCategoryInsight(transactions), [transactions])
  const healthScore = useMemo(() => computeHealthScore(transactions, goals), [transactions, goals])

  const axisColor = theme === 'dark' ? '#9CA8A4' : '#5C6B67'
  const gridColor = theme === 'dark' ? '#33413D' : '#E8E2D6'
  const tooltipBg = theme === 'dark' ? '#242B29' : '#FFFFFF'

  const isSparse = !loading && transactions.length < SPARSE_THRESHOLD

  if (!loading && transactions.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl text-ink">
            {firstName ? `Good to see you, ${firstName}` : 'Your financial picture'}
          </h1>
          <p className="mt-1 text-ink-muted">Here's where things stand today.</p>
        </div>
        <div className="card flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-teal-dark">
            <Receipt size={22} />
          </span>
          <h2 className="font-display text-xl text-ink">Nothing tracked yet</h2>
          <p className="max-w-sm text-ink-muted">
            Add a few expenses or import a CSV and your dashboard will fill in with real numbers,
            charts, and insights.
          </p>
          <Link to="/expenses" className="mt-2 inline-flex rounded-full bg-teal px-5 py-2.5 font-medium text-white transition hover:bg-teal-dark">
            Go to Expenses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">
          {firstName ? `Good to see you, ${firstName}` : 'Your financial picture'}
        </h1>
        <p className="mt-1 text-ink-muted">Here's where things stand today.</p>
      </div>

      <HealthScoreCard result={healthScore} />

      <div className="card grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div>
          <p className="text-sm text-ink-muted">Total tracked</p>
          <p className="mt-1 font-display text-4xl text-ink">{currency(stats.totalTracked)}</p>
          <p className="mt-1 text-xs text-ink-muted">All income minus expenses you've recorded</p>
        </div>
        <div>
          <p className="text-sm text-ink-muted">This month</p>
          <p className="mt-1 font-display text-2xl text-ink">
            <span className="text-teal-dark">{currency(stats.monthlyIncome)}</span>
            <span className="mx-1 text-base font-sans text-ink-muted">in</span>
          </p>
          <p className="font-display text-2xl text-ink">
            <span className="text-danger">{currency(stats.monthlyExpenses)}</span>
            <span className="mx-1 text-base font-sans text-ink-muted">out</span>
          </p>
        </div>
        <div>
          <p className="text-sm text-ink-muted">Savings rate</p>
          <p className="mt-1 font-display text-4xl text-ink">
            {stats.savingsRate == null ? '—' : `${Math.round(stats.savingsRate * 100)}%`}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {stats.savingsRate == null ? 'No income logged this month yet' : 'Of this month\'s income'}
          </p>
        </div>
      </div>

      {insight && (
        <div className="rounded-card border border-marigold/30 bg-marigold-tint p-6">
          <div className="flex items-center gap-2 text-marigold">
            <Sparkles size={18} />
            <p className="text-sm font-medium">Finora insight</p>
          </div>
          <p className="mt-2 text-ink">
            {insight.category} is your top category this month at {currency(insight.thisMonth)}
            {insight.threeMonthAverage > 0 ? (
              <>
                {' '}
                — {insight.percentDelta >= 0 ? 'up' : 'down'} {Math.abs(Math.round(insight.percentDelta))}% vs
                your 3-month average of {currency(insight.threeMonthAverage)}.
              </>
            ) : (
              '.'
            )}
          </p>
        </div>
      )}

      {isSparse ? (
        <div className="card flex flex-col items-center gap-2 py-10 text-center">
          <p className="font-display text-xl text-ink">A few more transactions and this fills in nicely</p>
          <p className="max-w-sm text-ink-muted">
            Charts and trends need a bit of history first — add or import more expenses to unlock
            your cash flow and category breakdown.
          </p>
          <Link to="/expenses" className="mt-2 text-sm font-medium text-teal hover:text-teal-dark">
            Add more expenses →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="card">
            <h2 className="font-display text-xl text-ink">Cash flow</h2>
            <p className="mt-1 text-sm text-ink-muted">Weekly income vs. expenses, last 3 months</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="weekStart"
                    tick={{ fill: axisColor, fontSize: 11, fontFamily: 'Inter' }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    axisLine={{ stroke: gridColor }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11, fontFamily: 'Inter' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => currency(v)}
                    width={56}
                  />
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      border: `1px solid ${gridColor}`,
                      borderRadius: 12,
                      fontFamily: 'IBM Plex Mono',
                      fontSize: 12,
                    }}
                    formatter={(value) => currency(Number(value))}
                    labelFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#2A7F7B" fill="#2A7F7B" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#C4604A" fill="#C4604A" fillOpacity={0.12} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 className="font-display text-xl text-ink">Spending by category</h2>
            <p className="mt-1 text-sm text-ink-muted">This month</p>
            {categoryBreakdown.length === 0 ? (
              <p className="mt-8 text-center text-ink-muted">No expenses logged this month yet.</p>
            ) : (
              <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
                <div className="h-56 w-56 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                      >
                        {categoryBreakdown.map((entry, i) => (
                          <Cell key={entry.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: tooltipBg,
                          border: `1px solid ${gridColor}`,
                          borderRadius: 12,
                          fontFamily: 'IBM Plex Mono',
                          fontSize: 12,
                        }}
                        formatter={(value) => currency(Number(value))}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex w-full flex-col gap-2">
                  {categoryBreakdown.map((c, i) => (
                    <div key={c.category} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-ink">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                        />
                        {c.category}
                      </span>
                      <span className="font-mono text-ink-muted">{currency(c.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
