import { computeMonthlyHistory } from '../lib/history'
import type { Transaction } from '../types'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export function HistoryPanel({ transactions }: { transactions: Transaction[] }) {
  const months = computeMonthlyHistory(transactions)

  return (
    <div className="card flex h-[32rem] flex-col p-0">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-display text-lg text-ink">History</h2>
        <p className="mt-0.5 text-sm text-ink-muted">Every month since you started tracking.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {months.length === 0 ? (
          <p className="p-4 text-sm text-ink-muted">Nothing tracked yet.</p>
        ) : (
          months.map((m) => (
            <div key={m.key} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 transition hover:bg-teal-tint">
              <div>
                <p className="text-sm text-ink">{m.label}</p>
                <p className="text-xs text-ink-muted">
                  <span className="text-teal-dark">{currency(m.income)}</span> in · <span className="text-danger">{currency(m.expenses)}</span> out
                </p>
              </div>
              <p className={`shrink-0 font-mono text-sm ${m.net >= 0 ? 'text-teal-dark' : 'text-ink'}`}>
                {m.net >= 0 ? '+' : ''}
                {currency(m.net)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
