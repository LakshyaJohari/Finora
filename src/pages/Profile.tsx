import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Landmark, Trash2, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { useProfile } from '../hooks/useProfile'
import { Button } from '../components/Button'
import { RequireAuthButton } from '../components/RequireAuth'

export default function Profile() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const guard = useRequireAuth()
  const { profile, updateProfile } = useProfile()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)

  useEffect(() => {
    if (profile) setName(profile.full_name ?? '')
  }, [profile])

  useEffect(() => {
    const section = searchParams.get('section')
    if (section) {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searchParams])

  async function handleSaveName() {
    setSavingName(true)
    setNameSaved(false)
    try {
      await updateProfile({ full_name: name.trim() || null })
      setNameSaved(true)
    } finally {
      setSavingName(false)
    }
  }

  if (!user) {
    return (
      <div className="card mx-auto flex max-w-md flex-col items-center gap-3 text-center">
        <h1 className="font-display text-2xl text-ink">Log in to manage your account</h1>
        <p className="text-ink-muted">
          Account settings, connected accounts, and privacy controls live here once you're signed in.
        </p>
        <Link to="/login">
          <Button>Log in</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Account settings</h1>
        <p className="mt-1 text-ink-muted">Manage your profile, accounts, and preferences.</p>
      </div>

      <section id="personal" className="card flex flex-col gap-4">
        <h2 className="font-display text-xl text-ink">Personal info</h2>
        <label className="text-sm text-ink-muted">
          Full name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-ink"
          />
        </label>
        <label className="text-sm text-ink-muted">
          Email
          <input
            value={user.email ?? ''}
            disabled
            type="email"
            className="mt-1 w-full rounded-lg border border-border bg-base px-3 py-2 text-ink-muted"
          />
        </label>
        <div className="flex items-center gap-3">
          <RequireAuthButton action={handleSaveName} disabled={savingName} className="self-start">
            {savingName ? 'Saving…' : 'Save changes'}
          </RequireAuthButton>
          {nameSaved && <span className="text-sm text-teal-dark">Saved.</span>}
        </div>
      </section>

      <section id="notifications" className="card flex flex-col gap-4">
        <h2 className="font-display text-xl text-ink">Notification preferences</h2>
        <label className="flex items-center justify-between text-ink">
          Email notifications
          <input
            type="checkbox"
            checked={emailNotifs}
            onChange={(e) => guard(() => setEmailNotifs(e.target.checked))}
            className="h-5 w-5 accent-teal"
          />
        </label>
        <label className="flex items-center justify-between text-ink">
          Weekly spending digest
          <input
            type="checkbox"
            checked={weeklyDigest}
            onChange={(e) => guard(() => setWeeklyDigest(e.target.checked))}
            className="h-5 w-5 accent-teal"
          />
        </label>
      </section>

      <section id="accounts" className="card flex flex-col gap-4">
        <h2 className="font-display text-xl text-ink">Connected accounts</h2>
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border bg-base py-8 text-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-tint text-teal-dark">
            <Landmark size={16} />
          </span>
          <p className="text-sm text-ink-muted">
            No accounts connected yet. You're tracking expenses manually or via CSV import for now.
          </p>
        </div>
        <RequireAuthButton action={() => {}} variant="secondary" className="self-start" disabled>
          Connect an account (coming soon)
        </RequireAuthButton>
      </section>

      <section id="theme" className="card flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">Theme preference</h2>
          <p className="mt-1 text-ink-muted">Currently using {theme} mode.</p>
        </div>
        <Button variant="secondary" onClick={toggleTheme}>
          Switch to {theme === 'dark' ? 'light' : 'dark'}
        </Button>
      </section>

      <section id="privacy" className="card flex flex-col gap-4">
        <h2 className="font-display text-xl text-ink">Data & privacy</h2>
        <div className="flex items-center justify-between">
          <p className="text-ink">Download a copy of your data</p>
          <RequireAuthButton action={() => {}} variant="secondary">
            <Download size={16} />
            Export
          </RequireAuthButton>
        </div>
        <div className="flex items-center justify-between rounded-card border border-danger/30 bg-danger-tint p-4">
          <div>
            <p className="text-ink">Delete account</p>
            <p className="text-sm text-ink-muted">This permanently removes your data.</p>
          </div>
          <RequireAuthButton
            action={() => {}}
            className="!bg-danger hover:!bg-danger/90"
          >
            <Trash2 size={16} />
            Delete
          </RequireAuthButton>
        </div>
      </section>
    </div>
  )
}
