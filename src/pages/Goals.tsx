import { useState } from 'react'
import { Plus } from 'lucide-react'
import { RequireAuthButton } from '../components/RequireAuth'
import { Button } from '../components/Button'
import { demoGoals } from '../data/demoData'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function Goals() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Goals</h1>
          <p className="mt-1 text-ink-muted">What you're saving toward, and how close you are.</p>
        </div>
        <RequireAuthButton action={() => setShowForm(true)} className="shrink-0">
          <Plus size={16} />
          Create goal
        </RequireAuthButton>
      </div>

      {showForm && (
        <form
          className="card flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            setShowForm(false)
          }}
        >
          <h2 className="font-display text-xl text-ink">New goal</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm text-ink-muted">
              Goal name
              <input
                required
                type="text"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink"
                placeholder="e.g. Down payment"
              />
            </label>
            <label className="text-sm text-ink-muted">
              Target amount
              <input
                required
                type="number"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-ink"
                placeholder="0"
              />
            </label>
          </div>
          <div className="flex gap-3">
            <Button type="submit">Save goal</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {demoGoals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100))
          return (
            <div key={goal.id} className="card">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-xl text-ink">{goal.name}</h2>
                <span className="text-sm text-ink-muted">
                  by {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <p className="mt-3 font-display text-3xl text-ink">
                {currency(goal.saved)}{' '}
                <span className="font-sans text-base font-normal text-ink-muted">of {currency(goal.target)}</span>
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-teal-tint">
                <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-sm text-ink-muted">{pct}% complete</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
