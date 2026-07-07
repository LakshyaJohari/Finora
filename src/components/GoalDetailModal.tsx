import { useMemo } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Modal } from './Modal'
import { useTheme } from '../context/ThemeContext'
import type { Goal } from '../types'
import { computeGoalProjection, goalStatusLabel, goalSuggestion } from '../lib/goalProjection'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const STATUS_TINT: Record<string, string> = {
  achieved: 'bg-teal-tint text-teal-dark',
  'on-track': 'bg-teal-tint text-teal-dark',
  'needs-adjustment': 'bg-marigold-tint text-marigold',
  'at-risk': 'bg-danger-tint text-danger',
  unknown: 'bg-base text-ink-muted border border-border',
}

export function GoalDetailModal({
  goal,
  avgMonthlySavings,
  onClose,
}: {
  goal: Goal
  avgMonthlySavings: number | null
  onClose: () => void
}) {
  const { theme } = useTheme()
  const projection = useMemo(() => computeGoalProjection(goal, avgMonthlySavings), [goal, avgMonthlySavings])
  const suggestion = useMemo(
    () => goalSuggestion(goal, projection, avgMonthlySavings),
    [goal, projection, avgMonthlySavings],
  )

  const gridColor = theme === 'dark' ? '#33413D' : '#E8E2D6'
  const axisColor = theme === 'dark' ? '#9CA8A4' : '#5C6B67'
  const tooltipBg = theme === 'dark' ? '#242B29' : '#FFFFFF'

  const chartData = useMemo(() => {
    const now = Date.now()
    const points = new Map<number, { ts: number; neededPace?: number; yourPace?: number }>()
    const upsert = (ts: number, key: 'neededPace' | 'yourPace', value: number) => {
      const existing = points.get(ts) ?? { ts }
      existing[key] = value
      points.set(ts, existing)
    }

    upsert(now, 'neededPace', goal.current_amount)
    upsert(now, 'yourPace', goal.current_amount)

    if (goal.target_date) {
      upsert(new Date(goal.target_date).getTime(), 'neededPace', goal.target_amount)
    }
    if (projection.projectedCompletionDate) {
      upsert(new Date(projection.projectedCompletionDate).getTime(), 'yourPace', goal.target_amount)
    }

    return Array.from(points.values()).sort((a, b) => a.ts - b.ts)
  }, [goal, projection])

  const hasProjectionLines = chartData.length > 1

  return (
    <Modal title={goal.name} onClose={onClose} widthClassName="max-w-xl">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-3xl text-ink">
              {currency(goal.current_amount)}{' '}
              <span className="font-sans text-base font-normal text-ink-muted">of {currency(goal.target_amount)}</span>
            </p>
            {goal.target_date && (
              <p className="text-sm text-ink-muted">
                Target: {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_TINT[projection.status]}`}>
            {goalStatusLabel(projection.status)}
          </span>
        </div>

        {hasProjectionLines && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="ts"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fill: axisColor, fontSize: 11, fontFamily: 'Inter' }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
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
                  labelFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  formatter={(value) => currency(Number(value))}
                />
                {goal.target_date && (
                  <Line type="monotone" dataKey="neededPace" name="Needed pace" stroke="#9CA8A4" strokeDasharray="4 4" dot={false} connectNulls />
                )}
                {projection.projectedCompletionDate && (
                  <Line type="monotone" dataKey="yourPace" name="Your pace" stroke="#2A7F7B" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 rounded-card border border-border bg-base p-4">
          <div>
            <p className="text-xs text-ink-muted">Projected completion</p>
            <p className="mt-1 font-mono text-sm text-ink">
              {projection.projectedCompletionDate
                ? new Date(projection.projectedCompletionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Needed per month</p>
            <p className="mt-1 font-mono text-sm text-ink">
              {projection.requiredMonthlySavings != null ? currency(projection.requiredMonthlySavings) : '—'}
            </p>
          </div>
        </div>

        <div className="rounded-card border border-teal/20 bg-teal-tint p-4">
          <p className="text-sm text-ink">{suggestion}</p>
        </div>
        <p className="text-xs text-ink-muted">
          Estimate only, based on your recent average savings - not a guarantee.
        </p>
      </div>
    </Modal>
  )
}
