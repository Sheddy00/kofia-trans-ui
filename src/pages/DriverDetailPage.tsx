import { ArrowLeft, Banknote, CheckCircle2, Gauge, Landmark, Route as RouteIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ApiError } from '../api/client'
import { useDriverRevenue, useDriverStatistics, useTrips } from '../api/hooks'
import type { Period } from '../api/types'
import { RevenueBarChart } from '../components/charts'
import { PeriodPicker } from '../components/PeriodPicker'
import { TripList } from '../components/TripList'
import { Card, CardHeader, EmptyState, ErrorState, Skeleton, SlowServerNotice, StatCard } from '../components/ui'
import { monthlyRevenue } from '../lib/aggregate'
import { byDateDesc } from '../lib/fleet'
import { formatAriary, formatKm, formatNumber, initials } from '../lib/format'
import { latestMonthPeriod, periodLabel } from '../lib/period'

export function DriverDetailPage() {
  const { driverId } = useParams()
  const stats = useDriverStatistics(driverId)
  const trips = useTrips({ driverId })
  const driverTrips = useMemo(() => [...(trips.data ?? [])].sort(byDateDesc), [trips.data])

  const [selected, setSelected] = useState<Period | null>(null)
  const period = selected ?? (trips.data ? latestMonthPeriod(driverTrips) : null)
  const revenue = useDriverRevenue(driverId, period)
  const monthly = useMemo(() => monthlyRevenue(driverTrips), [driverTrips])

  const back = (
    <Link
      to="/drivers"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
    >
      <ArrowLeft className="size-4" aria-hidden /> Chauffeurs
    </Link>
  )

  if (stats.isError) {
    const notFound = stats.error instanceof ApiError && stats.error.status === 404
    return (
      <>
        {back}
        <Card>
          {notFound ? (
            <EmptyState title="Chauffeur introuvable" description={`Aucun chauffeur ne correspond à « ${driverId} ».`} />
          ) : (
            <ErrorState error={stats.error} onRetry={() => stats.refetch()} />
          )}
        </Card>
      </>
    )
  }

  return (
    <>
      {back}
      <SlowServerNotice loading={stats.isPending} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white shadow-sm">
            {stats.data ? initials(stats.data.driverName) : ''}
          </span>
          <div>
            {stats.isPending ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{stats.data.driverName}</h1>
            )}
            <p className="text-slate-500 dark:text-slate-400">Chauffeur {driverId}</p>
          </div>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">Depuis l'affiliation</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Courses terminées" icon={CheckCircle2} loading={stats.isPending} value={stats.data && formatNumber(stats.data.completedTrips)} />
        <StatCard label="Distance totale" icon={RouteIcon} loading={stats.isPending} value={stats.data && formatKm(stats.data.totalDistanceKm)} />
        <StatCard
          label="Prix moyen au km"
          icon={Gauge}
          loading={stats.isPending}
          value={stats.data && formatAriary(Math.round(stats.data.averagePricePerKm))}
        />
      </div>

      <div className="mt-8 mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Revenus {period && `· ${periodLabel(period)}`}
        </h2>
        {period && <PeriodPicker value={period} onChange={setSelected} />}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Chiffre d'affaires"
          icon={Banknote}
          loading={!period || revenue.isPending}
          value={revenue.data && formatAriary(revenue.data.revenue)}
          hint="Courses terminées sur la période"
        />
        <StatCard
          label="Commission coopérative"
          icon={Landmark}
          loading={!period || revenue.isPending}
          value={revenue.data && formatAriary(revenue.data.cooperativeFee)}
          hint="15 % reversés à la coopérative"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader title="Évolution mensuelle" description="Chiffre d'affaires des courses terminées" />
          <div className="px-2 pt-4 pb-4">
            {trips.isPending ? (
              <Skeleton className="mx-3 h-56" />
            ) : monthly.length ? (
              <RevenueBarChart data={monthly} />
            ) : (
              <EmptyState title="Pas encore de revenus" />
            )}
          </div>
        </Card>
        <Card className="overflow-hidden xl:col-span-3">
          <CardHeader title="Historique des courses" description={`${driverTrips.length} course${driverTrips.length > 1 ? 's' : ''}`} />
          <div className="mt-3">
            {trips.isPending ? (
              <div className="space-y-3 px-5 pb-5">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : trips.isError ? (
              <ErrorState error={trips.error} onRetry={() => trips.refetch()} />
            ) : driverTrips.length ? (
              <TripList trips={driverTrips} showDriver={false} compact />
            ) : (
              <EmptyState title="Aucune course" />
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
