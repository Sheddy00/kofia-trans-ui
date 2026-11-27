import { LayoutDashboard, LogOut, Route as RouteIcon, Truck, Users, type LucideIcon } from 'lucide-react'
import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../auth/useAuth'
import { cx } from '../lib/cx'
import { initials } from '../lib/format'
import { Skeleton } from './ui'

const NAV: Array<{ to: string; label: string; icon: LucideIcon; end?: boolean }> = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/trips', label: 'Courses', icon: RouteIcon },
  { to: '/drivers', label: 'Chauffeurs', icon: Users },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="rounded-xl bg-brand-600 p-2 text-white shadow-sm">
        <Truck className="size-5" aria-hidden />
      </span>
      <div className="leading-tight">
        <p className="font-bold tracking-tight">Kofia Trans</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Coopérative de transport</p>
      </div>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const admin = role === 'ADMIN'
  return (
    <span
      className={cx(
        'rounded-full px-2 py-0.5 text-[11px] font-medium',
        admin
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
      )}
    >
      {admin ? 'Administrateur' : 'Lecture seule'}
    </span>
  )
}

function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      aria-label="Se déconnecter"
      title="Se déconnecter"
    >
      <LogOut className="size-5" />
    </button>
  )
}

export function Layout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                )
              }
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-slate-200 px-2 pt-4 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">Thème</span>
          <ThemeToggle />
        </div>
        {user && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {initials(user.username)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.username}</p>
              <RoleBadge role={user.role} />
            </div>
            <LogoutButton onClick={logout} />
          </div>
        )}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/90">
        <Logo />
        <div className="flex items-center gap-1">
          {user && <RoleBadge role={user.role} />}
          <ThemeToggle />
          <LogoutButton onClick={logout} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:py-10">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/95">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cx(
                'flex flex-col items-center gap-1 py-2.5 text-xs font-medium',
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400',
              )
            }
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
