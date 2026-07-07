import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, PiggyBank } from 'lucide-react'
import { RequireAuthButton } from '../components/RequireAuth'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { GoalFormModal } from '../components/GoalFormModal'
import { GoalDetailModal } from '../components/GoalDetailModal'
import { useGoals, type NewGoal } from '../hooks/useGoals'
import { useTransactions } from '../hooks/useTransactions'
import { computeAverageMonthlySavings, computeGoalProjection, goalStatusLabel } from '../lib/goalProjection'
import type { Goal } from '../types'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const STARTER_GOALS: Partial<NewGoal>[] = [
  { name: 'Emergency Fund', target_amount: 15000, current_amount: 0, category: 'Emergency Fund' },
  { name: 'Vacation Fund', target_amount: 3000, current_amount: 0, category: 'Travel' },
  { name: 'New Laptop', target_amount: 2000, current_amount: 0, category: 'Other' },
]

export default function Goals() {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useGoals()
  const { transactions } = useTransactions()
  const guard = useRequireAuth()

  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [prefill, setPrefill] = useState<Partial<NewGoal> | undefined>(undefined)
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null)

  const avgMonthlySavings = useMemo(() => computeAverageMonthlySavings(transactions), [transactions])

  function openCreate(initial?: Partial<NewGoal>) {
    setEditingGoal(null)
    setPrefill(initial)
    setShowForm(true)
  }

  function openEdit(goal: Goal) {
    setEditingGoal(goal)
    setPrefill(undefined)
    setShowForm(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Goals</h1>
          <p className="mt-1 text-ink-muted">What you're saving toward, and how close you are.</p>
        </div>
        <RequireAuthButton action={() => openCreate()}>
          <Plus size={16} />
          Add goal
        </RequireAuthButton>
      </div>

      {showForm && (
        <GoalFormModal
          goal={editingGoal ?? undefined}
          initial={prefill}
          onClose={() => setShowForm(false)}
          onSubmit={(input) => (editingGoal ? updateGoal(editingGoal.id, input).then(() => {}) : addGoal(input).then(() => {}))}
        />
      )}

      {detailGoal && (
        <GoalDetailModal goal={detailGoal} avgMonthlySavings={avgMonthlySavings} onClose={() => setDetailGoal(null)} />
      )}

      {!loading && goals.length === 0 && (
        <div className="card flex flex-col items-center gap-4 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-teal-dark">
            <PiggyBank size={22} />
          </span>
          <div>
            <h2 className="font-display text-xl text-ink">No goals yet</h2>
            <p className="mt-1 max-w-sm text-ink-muted">
              Start with one of these, or create your own from scratch.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {STARTER_GOALS.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => guard(() => openCreate(s))}
                className="rounded-full border border-teal/30 bg-teal-tint px-4 py-2 text-sm font-medium text-teal-dark transition hover:bg-teal/20"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const projection = computeGoalProjection(goal, avgMonthlySavings)
          const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
          return (
            <div key={goal.id} className="card cursor-pointer" onClick={() => setDetailGoal(goal)}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-xl text-ink">{goal.name}</h2>
                  {goal.target_date && (
                    <p className="text-sm text-ink-muted">
                      by {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <RequireAuthButton
                    action={() => openEdit(goal)}
                    variant="ghost"
                    className="!px-2 !py-2"
                    aria-label="Edit goal"
                  >
                    <Pencil size={14} />
                  </RequireAuthButton>
                  <RequireAuthButton
                    action={() => deleteGoal(goal.id)}
                    variant="ghost"
                    className="!px-2 !py-2 hover:!bg-danger-tint hover:!text-danger"
                    aria-label="Delete goal"
                  >
                    <Trash2 size={14} />
                  </RequireAuthButton>
                </div>
              </div>

              <p className="mt-3 font-display text-3xl text-ink">
                {currency(goal.current_amount)}{' '}
                <span className="font-sans text-base font-normal text-ink-muted">of {currency(goal.target_amount)}</span>
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-teal-tint">
                <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-ink-muted">{pct}% complete</span>
                <span className="text-ink-muted">{goalStatusLabel(projection.status)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
