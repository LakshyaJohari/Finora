import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PiggyBank } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CoinFlipAnimation } from '../components/CoinFlipAnimation'
import { TopographicPattern } from '../components/TopographicPattern'
import { GoogleIcon } from '../components/GoogleIcon'
import { Button } from '../components/Button'

export default function Login() {
  const { user, signInWithPassword, signUpWithPassword, signInWithGoogle, consumePendingAction } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      consumePendingAction()
      navigate(redirect || '/dashboard', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signInWithPassword(email, password)
      setLoading(false)
      if (error) setError(error)
      return
    }

    const { error, needsConfirmation } = await signUpWithPassword(email, password)
    setLoading(false)
    if (error) {
      setError(error)
    } else if (needsConfirmation) {
      setInfo('Check your inbox to confirm your email, then log in.')
      setMode('login')
    }
  }

  async function handleGoogle() {
    setError(null)
    const { error } = await signInWithGoogle(redirect ?? undefined)
    if (error) setError(error)
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="relative hidden flex-col items-center justify-between overflow-hidden bg-teal p-10 md:flex">
        <TopographicPattern />
        <Link to="/" className="relative z-10 flex w-full items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <PiggyBank size={18} />
          </span>
          <span className="font-display text-lg font-semibold">Finora</span>
        </Link>

        <div className="relative z-10 h-64 w-64">
          <CoinFlipAnimation />
        </div>

        <h2 className="relative z-10 max-w-xs text-center font-display text-2xl leading-snug text-white">
          Grow your savings, one coin at a time.
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center bg-base px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 text-ink md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-white">
              <PiggyBank size={18} />
            </span>
            <span className="font-display text-lg font-semibold">Finora</span>
          </Link>

          <h1 className="font-display text-2xl text-ink">
            {mode === 'login' ? 'Welcome back to Finora' : 'Create your Finora account'}
          </h1>
          <p className="mt-1 text-ink-muted">
            {mode === 'login' ? 'Log in to save and sync your data.' : 'Takes less than a minute.'}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 font-medium text-ink transition hover:bg-teal-tint"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-sm text-ink-muted">
            <span className="h-px flex-1 bg-border" />
            Or
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-sm text-ink-muted">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-ink"
                placeholder="you@example.com"
              />
            </label>
            <label className="text-sm text-ink-muted">
              Password
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-ink"
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger">{error}</p>
            )}
            {info && (
              <p className="rounded-lg bg-teal-tint px-3 py-2 text-sm text-teal-dark">{info}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Please wait…' : 'Continue'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setError(null)
                setInfo(null)
              }}
              className="font-medium text-teal hover:text-teal-dark"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
