import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, LogOut, Settings, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from './ThemeToggle'

function initialsFor(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ProfileDropdown() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split('@')[0] ?? 'Guest'
  const email = user?.email ?? 'Not signed in'

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  function goTo(path: string) {
    setOpen(false)
    navigate(path)
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-teal font-display text-sm font-semibold text-white transition hover:bg-teal-dark"
      >
        {user ? initialsFor(displayName) : <Settings size={16} />}
      </button>

      {open && (
        <div className="card absolute right-0 z-50 mt-2 w-72 origin-top-right p-0 overflow-hidden">
          <div className="border-b border-border p-4">
            <p className="font-display text-base text-ink">{displayName}</p>
            <p className="truncate text-sm text-ink-muted">{email}</p>
            {!user && (
              <button
                type="button"
                onClick={() => goTo('/login')}
                className="mt-3 w-full rounded-full bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-dark"
              >
                Log in
              </button>
            )}
          </div>

          <div className="p-1.5">
            <button
              type="button"
              onClick={() => goTo('/profile')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink transition hover:bg-teal-tint"
            >
              <Settings size={16} className="text-ink-muted" />
              Account settings
            </button>
            <button
              type="button"
              onClick={() => goTo('/profile?section=notifications')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink transition hover:bg-teal-tint"
            >
              <SlidersHorizontal size={16} className="text-ink-muted" />
              Notification preferences
            </button>
            <a
              href="mailto:support@finora.app"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink transition hover:bg-teal-tint"
            >
              <HelpCircle size={16} className="text-ink-muted" />
              Help & support
            </a>
          </div>

          <div className="border-t border-border p-3">
            <ThemeToggle className="w-full justify-center" />
          </div>

          {user && (
            <div className="border-t border-border p-1.5">
              <button
                type="button"
                onClick={async () => {
                  await signOut()
                  setOpen(false)
                  navigate('/')
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-danger transition hover:bg-danger-tint"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
