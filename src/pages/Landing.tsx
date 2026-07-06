import { Link } from 'react-router-dom'
import { LineChart, PiggyBank, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '../components/Button'

const features = [
  {
    icon: LineChart,
    tint: 'teal' as const,
    title: 'Track expenses effortlessly',
    body: 'Every transaction, auto-categorized and laid out clearly — no spreadsheets required.',
  },
  {
    icon: PiggyBank,
    tint: 'marigold' as const,
    title: 'Goals that stick',
    body: 'Set a target, watch your progress bar move, and stay motivated with visible milestones.',
  },
  {
    icon: Sparkles,
    tint: 'marigold' as const,
    title: 'AI-powered insights',
    body: 'Your Finora advisor spots patterns in your spending and suggests small, doable changes.',
  },
  {
    icon: ShieldCheck,
    tint: 'teal' as const,
    title: 'Bank-level security',
    body: 'Your data is encrypted end-to-end. We never sell it, ever.',
  },
]

const tintClasses = {
  teal: 'bg-teal-tint text-teal-dark',
  marigold: 'bg-marigold-tint text-marigold',
}

export default function Landing() {
  return (
    <div className="flex flex-col gap-24 pb-16">
      <section className="flex flex-col items-center gap-6 pt-12 text-center">
        <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-ink-muted">
          Personal finance, simplified
        </span>
        <h1 className="max-w-2xl font-display text-5xl leading-tight text-ink sm:text-6xl">
          See your money clearly. Grow it with confidence.
        </h1>
        <p className="max-w-xl text-lg text-ink-muted">
          Finora brings your spending, saving, and goals into one calm, honest view — and a
          little AI help along the way.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/login">
            <Button>Get started free</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary">Explore the dashboard</Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="card">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${tintClasses[f.tint]}`}>
              <f.icon size={18} />
            </span>
            <h2 className="mt-4 font-display text-xl text-ink">{f.title}</h2>
            <p className="mt-2 text-ink-muted">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="card flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-3xl text-ink">Ready to grow your savings, one coin at a time?</h2>
        <p className="max-w-md text-ink-muted">
          Browse Finora free, no account needed. Sign up whenever you're ready to save your data.
        </p>
        <Link to="/login">
          <Button>Create your free account</Button>
        </Link>
      </section>
    </div>
  )
}
