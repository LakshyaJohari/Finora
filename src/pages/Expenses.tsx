import { useState } from 'react'
import { Plus } from 'lucide-react'
import { RequireAuthButton } from '../components/RequireAuth'
import { Button } from '../components/Button'
import { demoTransactions } from '../data/demoData'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export default function Expenses() {
  const [showForm, setShowForm] = useState(false)
  const expenses = demoTransactions.filter((tx) => tx.amount < 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Expenses</h1>
          <p className="mt-1 text-ink-muted">Everything you've spent, in one place.</p>
        </div>
        <RequireAuthButton action={() => setShowForm(true)} className="shrink-0">
          <Plus size={16} />
          Add expense
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
          <h2 className="font-display text-xl text-ink">New expense</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm text-ink-muted">
              Merchant
              <input
                required
                type="text"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink"
                placeholder="e.g. Trader Joe's"
              />
            </label>
            <label className="text-sm text-ink-muted">
              Amount
              <input
                required
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-ink"
                placeholder="0.00"
              />
            </label>
            <label className="text-sm text-ink-muted">
              Category
              <input
                required
                type="text"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink"
                placeholder="e.g. Groceries"
              />
            </label>
            <label className="text-sm text-ink-muted">
              Date
              <input
                required
                type="date"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink"
              />
            </label>
          </div>
          <div className="flex gap-3">
            <Button type="submit">Save expense</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="divide-y divide-border">
          {expenses.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-ink">{tx.merchant}</p>
                <p className="text-sm text-ink-muted">
                  {tx.category} &middot;{' '}
                  {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <p className="font-mono text-sm text-ink">{currency(tx.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
