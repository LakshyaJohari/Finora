import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import { Button } from '../components/Button'
import { useTransactions } from '../hooks/useTransactions'
import { computeMonthlyHistory } from '../lib/history'
import { MonthDetailModal } from '../components/MonthDetailModal'
import { CardSkeleton, ErrorNotice } from '../components/Skeleton'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function History() {
  const { transactions, loading, error } = useTransactions()
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null)

  const monthlyHistory = useMemo(() => computeMonthlyHistory(transactions), [transactions])

  const byYear = useMemo(() => {
    const map = new Map<string, typeof monthlyHistory>()
    for (const m of monthlyHistory) {
      const year = m.key.slice(0, 4)
      const bucket = map.get(year) ?? []
      bucket.push(m)
      map.set(year, bucket)
    }
    return Array.from(map.entries())
  }, [monthlyHistory])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl text-ink">History</h1>
          <p className="mt-1 text-ink-muted">Every month you've tracked, at a glance.</p>
        </div>
        <CardSkeleton lines={4} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl text-ink">History</h1>
          <p className="mt-1 text-ink-muted">Every month you've tracked, at a glance.</p>
        </div>
        <ErrorNotice message="Couldn't load your history right now. Try refreshing the page." />
      </div>
    )
  }

  if (monthlyHistory.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl text-ink">History</h1>
          <p className="mt-1 text-ink-muted">Every month you've tracked, at a glance.</p>
        </div>
        <div className="card flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-teal-dark">
            <Receipt size={22} />
          </span>
          <h2 className="font-display text-xl text-ink">Nothing tracked yet</h2>
          <p className="max-w-sm text-ink-muted">
            Add a few expenses or import a CSV and your monthly history will show up here.
          </p>
          <Link to="/expenses" className="mt-2">
            <Button>Go to Expenses</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">History</h1>
        <p className="mt-1 text-ink-muted">Every month you've tracked, at a glance.</p>
      </div>

      {byYear.map(([year, months]) => (
        <div key={year} className="flex flex-col gap-3">
          <h2 className="font-display text-xl text-ink">{year}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {months.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedMonthKey(m.key)}
                className="card text-left transition hover:border-teal/40 hover:shadow-md"
              >
                <p className="font-display text-lg text-ink">{m.label}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-teal-dark">{currency(m.income)}</span>
                  <span className="text-danger">{currency(m.expenses)}</span>
                </div>
                <p className={`mt-2 font-mono text-sm ${m.net >= 0 ? 'text-teal-dark' : 'text-ink'}`}>
                  Net {m.net >= 0 ? '+' : ''}
                  {currency(m.net)}
                </p>
              </button>
            ))}
          </div>
        </div>
      ))}

      {selectedMonthKey && (
        <MonthDetailModal
          monthKey={selectedMonthKey}
          transactions={transactions}
          onClose={() => setSelectedMonthKey(null)}
        />
      )}
    </div>
  )
}
