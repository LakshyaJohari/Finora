import { useMemo } from 'react'
import { Modal } from './Modal'
import { CategoryDonut } from './CategoryDonut'
import { CategoryBadge } from './CategoryBadge'
import { computeStats, computeCategoryBreakdown, isSameMonth } from '../lib/dashboardStats'
import type { Transaction } from '../types'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function MonthDetailModal({
  monthKey,
  transactions,
  onClose,
}: {
  monthKey: string
  transactions: Transaction[]
  onClose: () => void
}) {
  const refDate = useMemo(() => {
    const [y, m] = monthKey.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, 1))
  }, [monthKey])

  const label = useMemo(
    () => refDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    [refDate],
  )

  const stats = useMemo(() => computeStats(transactions, refDate), [transactions, refDate])
  const categoryBreakdown = useMemo(() => computeCategoryBreakdown(transactions, refDate), [transactions, refDate])
  const monthTransactions = useMemo(
    () =>
      transactions
        .filter((t) => isSameMonth(t.transaction_date, refDate))
        .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date)),
    [transactions, refDate],
  )

  return (
    <Modal title={label} onClose={onClose} widthClassName="max-w-2xl">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-4 rounded-card border border-border bg-base p-4">
          <div>
            <p className="text-xs text-ink-muted">Income</p>
            <p className="mt-1 font-display text-xl text-teal-dark">{currency(stats.monthlyIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Expenses</p>
            <p className="mt-1 font-display text-xl text-danger">{currency(stats.monthlyExpenses)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Net</p>
            <p className="mt-1 font-display text-xl text-ink">
              {currency(stats.monthlyIncome - stats.monthlyExpenses)}
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg text-ink">Spending by category</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No expenses logged this month.</p>
          ) : (
            <div className="mt-3">
              <CategoryDonut data={categoryBreakdown} />
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display text-lg text-ink">Transactions</h3>
          <div className="mt-2 max-h-64 divide-y divide-border overflow-y-auto rounded-card border border-border">
            {monthTransactions.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-ink-muted">No transactions this month.</p>
            ) : (
              monthTransactions.map((tx) => (
                <div key={tx.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div>
                    <p className="text-sm text-ink">{tx.merchant || tx.description || 'Transaction'}</p>
                    <p className="text-xs text-ink-muted">
                      {new Date(tx.transaction_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={tx.category} />
                    <p className={`w-24 text-right font-mono text-sm ${tx.amount > 0 ? 'text-teal-dark' : 'text-ink'}`}>
                      {tx.amount > 0 ? '+' : ''}
                      {currency(tx.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
