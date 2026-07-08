import { NavLink, Link } from 'react-router-dom'
import { Bell, PiggyBank, Search } from 'lucide-react'
import { ProfileDropdown } from './ProfileDropdown'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/goals', label: 'Goals' },
  { to: '/advisor', label: 'Advisor' },
  { to: '/history', label: 'History' },
]

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-base/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal text-white">
            <PiggyBank size={18} />
          </span>
          <span className="font-display text-lg font-semibold text-ink">Finora</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `border-b-2 px-3 py-5 text-sm font-medium transition ${
                  isActive
                    ? 'border-teal text-teal'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <label className="relative hidden sm:block">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              placeholder="Search Finora..."
              className="w-40 rounded-full border border-border bg-surface py-1.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:w-56 transition-all"
            />
          </label>
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-teal-tint hover:text-teal-dark"
          >
            <Bell size={18} />
          </button>
          <ProfileDropdown />
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-2 md:hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition ${
                isActive ? 'border-teal text-teal' : 'border-transparent text-ink-muted'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
