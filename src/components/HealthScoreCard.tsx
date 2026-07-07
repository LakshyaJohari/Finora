import { Gauge } from 'lucide-react'
import { HealthScoreGauge } from './HealthScoreGauge'
import type { HealthScoreResult } from '../lib/healthScore'

export function HealthScoreCard({ result }: { result: HealthScoreResult }) {
  if (result.score == null) {
    return (
      <div className="card flex flex-col items-center gap-3 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-teal-dark">
          <Gauge size={22} />
        </span>
        <h2 className="font-display text-xl text-ink">Your financial health score</h2>
        <p className="max-w-sm text-ink-muted">
          Log a few transactions and set a goal or two, and we'll calculate your score from real
          savings rate, spending consistency, and goal progress.
        </p>
      </div>
    )
  }

  return (
    <div className="card border-2 border-teal/15 p-8 shadow-softer">
      <h2 className="font-display text-2xl text-ink">Financial health score</h2>
      <p className="mt-1 text-sm text-ink-muted">A single number, built from your real numbers.</p>

      <div className="mt-6 flex flex-col items-center gap-8 lg:flex-row lg:items-start">
        <HealthScoreGauge score={result.score} />

        <div className="flex w-full flex-col gap-4">
          {result.components.map((c) => (
            <div key={c.key}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink">{c.label}</span>
                <span className="text-ink-muted">{c.score == null ? 'Not enough data' : `${Math.round(c.score)}/100`}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-teal-tint">
                <div
                  className="h-full rounded-full bg-teal transition-all duration-700"
                  style={{ width: `${c.score ?? 0}%`, opacity: c.score == null ? 0.25 : 1 }}
                />
              </div>
              <p className="mt-1 text-xs text-ink-muted">{c.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
