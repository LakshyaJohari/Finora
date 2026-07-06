import { Sparkles, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  demoMonthlySpend,
  demoNetWorth,
  demoSavingsRate,
  demoTransactions,
} from '../data/demoData'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function Dashboard() {
  const { user } = useAuth()
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">
          {firstName ? `Good to see you, ${firstName}` : 'Your financial picture'}
        </h1>
        <p className="mt-1 text-ink-muted">Here's where things stand today.</p>
      </div>

      <div className="card grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div>
          <p className="text-sm text-ink-muted">Net worth</p>
          <p className="mt-1 font-display text-4xl text-ink">{currency(demoNetWorth)}</p>
        </div>
        <div>
          <p className="text-sm text-ink-muted">Savings rate</p>
          <p className="mt-1 font-display text-4xl text-ink">{Math.round(demoSavingsRate * 100)}%</p>
        </div>
        <div>
          <p className="text-sm text-ink-muted">Spent this month</p>
          <p className="mt-1 font-display text-4xl text-ink">{currency(demoMonthlySpend)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-card border border-marigold/30 bg-marigold-tint p-6">
          <div className="flex items-center gap-2 text-marigold">
            <Sparkles size={18} />
            <p className="text-sm font-medium">Finora insight</p>
          </div>
          <p className="mt-2 text-ink">
            You're spending 18% less on dining out than last month. Redirecting that $150/mo to your
            Emergency fund would get you there ~2 months sooner.
          </p>
        </div>
        <div className="rounded-card border border-teal/20 bg-teal-tint p-6">
          <div className="flex items-center gap-2 text-teal-dark">
            <ShieldCheck size={18} />
            <p className="text-sm font-medium">All accounts synced</p>
          </div>
          <p className="mt-2 text-ink">
            3 accounts connected. Balances were last refreshed a few minutes ago.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="font-display text-xl text-ink">Recent transactions</h2>
        <div className="mt-4 divide-y divide-border">
          {demoTransactions.slice(0, 6).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-ink">{tx.merchant}</p>
                <p className="text-sm text-ink-muted">
                  {tx.category} &middot; {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <p className={`font-mono text-sm ${tx.amount > 0 ? 'text-teal-dark' : 'text-ink'}`}>
                {tx.amount > 0 ? '+' : ''}
                {currency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
