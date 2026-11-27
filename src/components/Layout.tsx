import { LayoutDashboard, Route as RouteIcon, Truck, Users, type LucideIcon } from 'lucide-react'
import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router'
import { ThemeToggle } from './ThemeToggle'
import { cx } from '../lib/cx'
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

export function Layout() {
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
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/90">
        <Logo />
        <ThemeToggle />
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
