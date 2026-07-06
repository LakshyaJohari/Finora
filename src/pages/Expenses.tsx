import { useMemo, useState } from 'react'
import { Plus, Upload, Receipt } from 'lucide-react'
import { RequireAuthButton } from '../components/RequireAuth'
import { AddExpenseModal } from '../components/AddExpenseModal'
import { ImportCsvModal } from '../components/ImportCsvModal'
import { CategoryBadge } from '../components/CategoryBadge'
import { useTransactions } from '../hooks/useTransactions'
import { TRANSACTION_CATEGORIES } from '../types'

const currency = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export default function Expenses() {
  const { transactions, loading, addTransaction, bulkInsertTransactions } = useTransactions()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  const visible = useMemo(() => {
    let rows = transactions
    if (categoryFilter !== 'All') {
      rows = rows.filter((t) => t.category === categoryFilter)
    }
    return [...rows].sort((a, b) =>
      sortDir === 'desc'
        ? b.transaction_date.localeCompare(a.transaction_date)
        : a.transaction_date.localeCompare(b.transaction_date),
    )
  }, [transactions, categoryFilter, sortDir])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Expenses</h1>
          <p className="mt-1 text-ink-muted">Everything you've spent, in one place.</p>
        </div>
        <div className="flex gap-2">
          <RequireAuthButton action={() => setShowImportModal(true)} variant="secondary">
            <Upload size={16} />
            Bulk import
          </RequireAuthButton>
          <RequireAuthButton action={() => setShowAddModal(true)}>
            <Plus size={16} />
            Add expense
          </RequireAuthButton>
        </div>
      </div>

      {showAddModal && (
        <AddExpenseModal onClose={() => setShowAddModal(false)} onSubmit={(input) => addTransaction(input).then(() => {})} />
      )}
      {showImportModal && (
        <ImportCsvModal onClose={() => setShowImportModal(false)} onImport={(inputs) => bulkInsertTransactions(inputs).then(() => {})} />
      )}

      {!loading && transactions.length === 0 && (
        <div className="card flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-teal-dark">
            <Receipt size={22} />
          </span>
          <h2 className="font-display text-xl text-ink">No expenses yet</h2>
          <p className="max-w-sm text-ink-muted">
            Add your first expense manually, or import a CSV from your bank to get your history in
            all at once.
          </p>
          <div className="mt-2 flex gap-3">
            <RequireAuthButton action={() => setShowAddModal(true)}>Add an expense</RequireAuthButton>
            <RequireAuthButton action={() => setShowImportModal(true)} variant="secondary">
              Import a CSV
            </RequireAuthButton>
          </div>
        </div>
      )}

      {(loading || transactions.length > 0) && (
        <div className="card p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink"
            >
              <option value="All">All categories</option>
              {TRANSACTION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition hover:bg-teal-tint hover:text-teal-dark"
            >
              Date: {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
            </button>
          </div>

          {loading ? (
            <div className="divide-y divide-border">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-teal-tint" />
                  <div className="h-4 w-16 animate-pulse rounded bg-teal-tint" />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visible.map((tx) => (
                <div key={tx.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4">
                  <div>
                    <p className="text-ink">{tx.merchant || tx.description || 'Transaction'}</p>
                    <p className="text-sm text-ink-muted">
                      {new Date(tx.transaction_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CategoryBadge category={tx.category} />
                    <p className={`w-24 text-right font-mono text-sm ${tx.amount > 0 ? 'text-teal-dark' : 'text-ink'}`}>
                      {tx.amount > 0 ? '+' : ''}
                      {currency(tx.amount)}
                    </p>
                  </div>
                </div>
              ))}
              {visible.length === 0 && (
                <p className="px-6 py-8 text-center text-ink-muted">No transactions match this filter.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
