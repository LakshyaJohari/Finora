import { useState, type FormEvent } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { TRANSACTION_CATEGORIES, INCOME_CATEGORIES } from '../types'
import type { NewTransaction } from '../hooks/useTransactions'

type TxType = 'expense' | 'income'

const today = () => new Date().toISOString().slice(0, 10)

export function AddTransactionModal({
  initialType = 'expense',
  onClose,
  onSubmit,
}: {
  initialType?: TxType
  onClose: () => void
  onSubmit: (input: NewTransaction) => Promise<void>
}) {
  const [type, setType] = useState<TxType>(initialType)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(initialType === 'income' ? INCOME_CATEGORIES[0] : 'Uncategorized')
  const [merchant, setMerchant] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today())
  const [isRecurring, setIsRecurring] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function switchType(next: TxType) {
    setType(next)
    setCategory(next === 'income' ? INCOME_CATEGORIES[0] : 'Uncategorized')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!parsed || parsed <= 0) {
      setError('Enter an amount greater than 0.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        amount: type === 'income' ? Math.abs(parsed) : -Math.abs(parsed),
        category,
        merchant: merchant || null,
        description: description || null,
        transaction_date: date,
        is_recurring: isRecurring,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const categories = type === 'income' ? INCOME_CATEGORIES : TRANSACTION_CATEGORIES

  return (
    <Modal title={type === 'income' ? 'Add income' : 'Add expense'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="inline-flex w-fit rounded-full border border-border bg-base p-1">
          <button
            type="button"
            onClick={() => switchType('expense')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              type === 'expense' ? 'bg-teal text-white' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => switchType('income')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              type === 'income' ? 'bg-teal text-white' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Income
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm text-ink-muted">
            Amount
            <input
              autoFocus
              required
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-ink"
              placeholder="0.00"
            />
          </label>
          <label className="text-sm text-ink-muted">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-ink-muted">
            {type === 'income' ? 'Source' : 'Merchant'}
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink"
              placeholder={type === 'income' ? 'e.g. Employer, Broker' : "e.g. Trader Joe's"}
            />
          </label>
          <label className="text-sm text-ink-muted">
            Date
            <input
              required
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink"
            />
          </label>
        </div>
        <label className="text-sm text-ink-muted">
          Description
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink"
            placeholder="Optional note"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="h-4 w-4 accent-teal"
          />
          This is recurring
        </label>

        {error && <p className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : type === 'income' ? 'Save income' : 'Save expense'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
