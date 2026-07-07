import { useState, type FormEvent } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { GOAL_CATEGORIES } from '../types'
import type { NewGoal } from '../hooks/useGoals'
import type { Goal } from '../types'

export function GoalFormModal({
  goal,
  initial,
  onClose,
  onSubmit,
}: {
  goal?: Goal
  initial?: Partial<NewGoal>
  onClose: () => void
  onSubmit: (input: NewGoal) => Promise<void>
}) {
  const [name, setName] = useState(goal?.name ?? initial?.name ?? '')
  const [targetAmount, setTargetAmount] = useState(String(goal?.target_amount ?? initial?.target_amount ?? ''))
  const [currentAmount, setCurrentAmount] = useState(String(goal?.current_amount ?? initial?.current_amount ?? 0))
  const [targetDate, setTargetDate] = useState(goal?.target_date ?? initial?.target_date ?? '')
  const [category, setCategory] = useState(goal?.category ?? initial?.category ?? GOAL_CATEGORIES[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const target = Number(targetAmount)
    const current = Number(currentAmount)
    if (!name.trim()) {
      setError('Give this goal a name.')
      return
    }
    if (!target || target <= 0) {
      setError('Enter a target amount greater than 0.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        target_amount: target,
        current_amount: Number.isFinite(current) ? current : 0,
        target_date: targetDate || null,
        category,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={goal ? 'Edit goal' : 'New goal'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm text-ink-muted">
          Goal name
          <input
            autoFocus
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink"
            placeholder="e.g. Emergency Fund"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm text-ink-muted">
            Target amount
            <input
              required
              type="number"
              min="1"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-ink"
              placeholder="0.00"
            />
          </label>
          <label className="text-sm text-ink-muted">
            Starting amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-ink"
              placeholder="0.00"
            />
          </label>
          <label className="text-sm text-ink-muted">
            Target date
            <input
              type="date"
              value={targetDate ?? ''}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink"
            />
          </label>
          <label className="text-sm text-ink-muted">
            Category
            <select
              value={category ?? ''}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink"
            >
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : goal ? 'Save changes' : 'Create goal'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
