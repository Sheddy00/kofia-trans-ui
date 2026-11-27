import { ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { useDriverStatistics, useTrips } from '../api/hooks'
import type { DriverRef } from '../api/types'
import { Card, EmptyState, ErrorState, PageHeader, Skeleton, SlowServerNotice } from '../components/ui'
import { deriveDrivers } from '../lib/fleet'
import { formatAriary, formatKm, initials } from '../lib/format'

function DriverCard({ driver }: { driver: DriverRef }) {
  const stats = useDriverStatistics(driver.id)

  return (
    <Link to={`/drivers/${driver.id}`} className="group block">
      <Card className="p-5 transition group-hover:border-brand-500/50 group-hover:shadow-md">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
            {initials(driver.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{driver.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{driver.id}</p>
          </div>
          <ChevronRight className="size-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" aria-hidden />
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
          {stats.isPending ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)
          ) : stats.isError ? (
            <p className="col-span-3 text-sm text-red-600 dark:text-red-400">Statistiques indisponibles</p>
          ) : (
            <>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Courses</dt>
                <dd className="mt-1 font-semibold tabular-nums">{stats.data.completedTrips}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Distance</dt>
                <dd className="mt-1 font-semibold tabular-nums">{formatKm(stats.data.totalDistanceKm)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400">Prix / km</dt>
                <dd className="mt-1 font-semibold tabular-nums">{formatAriary(Math.round(stats.data.averagePricePerKm))}</dd>
              </div>
            </>
          )}
        </dl>
      </Card>
    </Link>
  )
}

export function DriversPage() {
  const trips = useTrips()
  const drivers = useMemo(() => deriveDrivers(trips.data ?? []), [trips.data])

  return (
    <>
      <PageHeader title="Chauffeurs" description="Performances de chaque chauffeur affilié (courses terminées)." />
      <SlowServerNotice loading={trips.isPending} />
      {trips.isError ? (
        <Card>
          <ErrorState error={trips.error} onRetry={() => trips.refetch()} />
        </Card>
      ) : trips.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <Card>
          <EmptyState title="Aucun chauffeur" description="Les chauffeurs apparaissent dès qu'ils ont effectué une course." />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {drivers.map((driver) => (
            <DriverCard key={driver.id} driver={driver} />
          ))}
        </div>
      )}
    </>
  )
}
