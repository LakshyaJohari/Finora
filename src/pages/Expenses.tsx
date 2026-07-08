import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, TrendingUp, Upload, Receipt, RefreshCw } from 'lucide-react'
import { RequireAuthButton } from '../components/RequireAuth'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { ImportCsvModal } from '../components/ImportCsvModal'
import { CategoryBadge } from '../components/CategoryBadge'
import { ReasoningHint } from '../components/ReasoningHint'
import { useTransactions } from '../hooks/useTransactions'
import { TRANSACTION_CATEGORIES, INCOME_CATEGORIES } from '../types'
import type { Transaction } from '../types'
import { categorizeTransactions } from '../lib/groq'
import { detectRecurring } from '../lib/recurring'
import { ErrorNotice } from '../components/Skeleton'

const currency = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export default function Expenses() {
  const { transactions, loading, error: fetchError, addTransaction, bulkInsertTransactions, updateTransaction } = useTransactions()
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalType, setAddModalType] = useState<'expense' | 'income'>('expense')
  const [showImportModal, setShowImportModal] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [categorizing, setCategorizing] = useState(false)
  const [categorizeNotice, setCategorizeNotice] = useState<string | null>(null)

  const recurringGroups = useMemo(() => detectRecurring(transactions), [transactions])
  const recurringSyncAttempted = useRef<Set<string>>(new Set())

  // Additive only: mark newly-detected recurring transactions, never clear a
  // flag a user set manually in the add-expense form. Tracks attempted ids in
  // a ref (not state) so an in-flight update can't be re-fired by the next
  // render before its response comes back and updates `transactions`.
  useEffect(() => {
    const toFlag = recurringGroups
      .flatMap((g) => g.transactionIds)
      .filter((id) => {
        if (recurringSyncAttempted.current.has(id)) return false
        const tx = transactions.find((t) => t.id === id)
        return tx && !tx.is_recurring
      })
    toFlag.forEach((id) => {
      recurringSyncAttempted.current.add(id)
      updateTransaction(id, { is_recurring: true }).catch(() => {
        recurringSyncAttempted.current.delete(id)
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurringGroups])

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

  async function categorizeAndUpdate(rows: Transaction[]) {
    const candidates = rows.filter((r) => r.category === 'Uncategorized')
    if (candidates.length === 0) return

    // The LLM categorizer only knows expense categories - a CSV-imported
    // deposit shouldn't get forced into one of those. Sign alone already
    // tells us it's income, so handle it deterministically instead.
    const incomeCandidates = candidates.filter((r) => r.amount >= 0)
    if (incomeCandidates.length > 0) {
      await Promise.all(
        incomeCandidates.map((r) => updateTransaction(r.id, { category: 'Other Income' }).catch(() => {})),
      )
    }

    const expenseCandidates = candidates.filter((r) => r.amount < 0)
    if (expenseCandidates.length === 0) return

    setCategorizing(true)
    setCategorizeNotice(null)
    const results = await categorizeTransactions(
      expenseCandidates.map((r) => ({ id: r.id, merchant: r.merchant, description: r.description, amount: r.amount })),
    )
    if (!results) {
      setCategorizeNotice("We couldn't auto-categorize these right now - they're saved as Uncategorized, and you can try again anytime.")
      setCategorizing(false)
      return
    }
    await Promise.all(
      results.map((r) =>
        updateTransaction(r.id, { category: r.category, ai_category_reasoning: r.reasoning }).catch(() => {}),
      ),
    )
    setCategorizing(false)
  }

  const uncategorizedCount = transactions.filter((t) => t.category === 'Uncategorized').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Expenses</h1>
          <p className="mt-1 text-ink-muted">Everything you've spent and earned, in one place.</p>
        </div>
        <div className="flex gap-2">
          <RequireAuthButton action={() => setShowImportModal(true)} variant="secondary">
            <Upload size={16} />
            Bulk import
          </RequireAuthButton>
          <RequireAuthButton
            action={() => {
              setAddModalType('income')
              setShowAddModal(true)
            }}
            variant="secondary"
          >
            <TrendingUp size={16} />
            Add income
          </RequireAuthButton>
          <RequireAuthButton
            action={() => {
              setAddModalType('expense')
              setShowAddModal(true)
            }}
          >
            <Plus size={16} />
            Add expense
          </RequireAuthButton>
        </div>
      </div>

      {showAddModal && (
        <AddTransactionModal
          initialType={addModalType}
          onClose={() => setShowAddModal(false)}
          onSubmit={(input) => addTransaction(input).then(() => {})}
        />
      )}
      {showImportModal && (
        <ImportCsvModal
          onClose={() => setShowImportModal(false)}
          onImport={(inputs) => bulkInsertTransactions(inputs).then((rows) => categorizeAndUpdate(rows))}
        />
      )}

      {fetchError && <ErrorNotice message="Couldn't load your expenses right now. Try refreshing the page." />}

      {categorizeNotice && (
        <p className="rounded-card border border-danger/20 bg-danger-tint px-4 py-3 text-sm text-danger">
          {categorizeNotice}
        </p>
      )}

      {recurringGroups.length > 0 && (
        <div className="card">
          <h2 className="font-display text-xl text-ink">Subscriptions</h2>
          <p className="mt-1 text-sm text-ink-muted">Recurring charges detected from your transaction history.</p>
          <div className="mt-3 divide-y divide-border">
            {recurringGroups.map((g) => (
              <div key={g.key} className="flex items-center justify-between py-2.5">
                <p className="text-ink">{g.label}</p>
                <p className="font-mono text-sm text-ink">{currency(g.averageAmount)}/mo</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <p className="font-medium text-ink">Monthly total</p>
            <p className="font-mono text-ink">
              {currency(recurringGroups.reduce((sum, g) => sum + g.averageAmount, 0))}/mo
            </p>
          </div>
        </div>
      )}

      {!loading && transactions.length === 0 && (
        <div className="card flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-teal-dark">
            <Receipt size={22} />
          </span>
          <h2 className="font-display text-xl text-ink">Nothing tracked yet</h2>
          <p className="max-w-sm text-ink-muted">
            Add your first expense or income manually, or import a CSV from your bank to get your
            history in all at once.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <RequireAuthButton
              action={() => {
                setAddModalType('expense')
                setShowAddModal(true)
              }}
            >
              Add an expense
            </RequireAuthButton>
            <RequireAuthButton
              action={() => {
                setAddModalType('income')
                setShowAddModal(true)
              }}
              variant="secondary"
            >
              Add income
            </RequireAuthButton>
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
              <optgroup label="Expense">
                {TRANSACTION_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Income">
                {INCOME_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </optgroup>
            </select>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-muted transition hover:bg-teal-tint hover:text-teal-dark"
            >
              Date: {sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
            </button>
            {uncategorizedCount > 0 && (
              <RequireAuthButton
                action={() => categorizeAndUpdate(transactions.filter((t) => t.category === 'Uncategorized'))}
                variant="ghost"
                disabled={categorizing}
                className="ml-auto"
              >
                <RefreshCw size={14} className={categorizing ? 'animate-spin' : ''} />
                {categorizing ? 'Categorizing…' : `Re-categorize ${uncategorizedCount}`}
              </RequireAuthButton>
            )}
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
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={tx.category} />
                    <ReasoningHint reasoning={tx.ai_category_reasoning} />
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
