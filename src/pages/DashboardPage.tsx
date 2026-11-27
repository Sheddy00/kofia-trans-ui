import { Ban, Banknote, CheckCircle2, Landmark, Route as RouteIcon, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useDriversRevenue, useTopEarningDriver, useTrips } from '../api/hooks'
import type { Period } from '../api/types'
import { RevenueBarChart } from '../components/charts'
import { PeriodPicker } from '../components/PeriodPicker'
import { TripList } from '../components/TripList'
import { Card, CardHeader, EmptyState, ErrorState, PageHeader, Skeleton, SlowServerNotice, StatCard } from '../components/ui'
import { monthlyRevenue } from '../lib/aggregate'
import { byDateDesc, deriveDrivers, isCompleted } from '../lib/fleet'
import { formatAriary, formatKm, formatNumber, initials } from '../lib/format'
import { isInPeriod, latestMonthPeriod, periodLabel } from '../lib/period'

export function DashboardPage() {
  const tripsQuery = useTrips()
  const trips = useMemo(() => tripsQuery.data ?? [], [tripsQuery.data])
  const [selected, setSelected] = useState<Period | null>(null)
  const period = selected ?? (tripsQuery.data ? latestMonthPeriod(trips) : null)

  const drivers = useMemo(() => deriveDrivers(trips), [trips])
  const revenueQueries = useDriversRevenue(
    drivers.map((driver) => driver.id),
    period,
  )
  const topDriver = useTopEarningDriver(period)

  const periodTrips = useMemo(
    () => (period ? trips.filter((trip) => isInPeriod(trip.tripDate, period)).sort(byDateDesc) : []),
    [trips, period],
  )
  const completed = periodTrips.filter(isCompleted)
  const cancelledCount = periodTrips.length - completed.length
  const distance = completed.reduce((sum, trip) => sum + trip.distanceKm, 0)

  const revenuesLoading = revenueQueries.some((query) => query.isPending)
  const revenues = revenueQueries.flatMap((query) => (query.data ? [query.data] : []))
  const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.revenue, 0)
  const totalFee = revenues.reduce((sum, revenue) => sum + revenue.cooperativeFee, 0)
  const revenueByDriver = revenues
    .map((revenue) => ({ label: revenue.driverName, value: revenue.revenue }))
    .sort((a, b) => b.value - a.value)
  const monthly = useMemo(() => monthlyRevenue(trips), [trips])

  if (tripsQuery.isError) {
    return (
      <Card>
        <ErrorState error={tripsQuery.error} onRetry={() => tripsQuery.refetch()} />
      </Card>
    )
  }

  const loading = tripsQuery.isPending || !period
  const top = topDriver.data

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description={period ? `Activité de la coopérative · ${periodLabel(period)}` : 'Activité de la coopérative'}
        actions={period && <PeriodPicker value={period} onChange={setSelected} />}
      />
      <SlowServerNotice loading={tripsQuery.isPending} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Chiffre d'affaires"
          icon={Banknote}
          loading={loading || revenuesLoading}
          value={formatAriary(totalRevenue)}
          hint="Courses terminées sur la période"
        />
        <StatCard
          label="Commission coopérative"
          icon={Landmark}
          loading={loading || revenuesLoading}
          value={formatAriary(totalFee)}
          hint="15 % du chiffre d'affaires"
        />
        <StatCard
          label="Courses terminées"
          icon={CheckCircle2}
          loading={loading}
          value={formatNumber(completed.length)}
          hint={
            <span className="inline-flex items-center gap-1">
              <Ban className="size-3" aria-hidden /> {cancelledCount} annulée{cancelledCount > 1 ? 's' : ''}
            </span>
          }
        />
        <StatCard label="Distance parcourue" icon={RouteIcon} loading={loading} value={formatKm(distance)} hint="Courses terminées" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-1">
          <div className="relative h-full bg-gradient-to-br from-brand-600 to-emerald-800 p-6 text-white">
            <Trophy className="absolute top-5 right-5 size-16 text-white/15" aria-hidden />
            <p className="text-sm font-medium text-emerald-100">Meilleur chauffeur de la période</p>
            {loading || topDriver.isPending ? (
              <Skeleton className="mt-6 h-16 w-48 bg-white/20 dark:bg-white/20" />
            ) : top && top.revenue > 0 ? (
              <Link to={`/drivers/${top.driverId}`} className="mt-5 flex items-center gap-4">
                <span className="flex size-14 items-center justify-center rounded-full bg-white/20 text-lg font-bold ring-2 ring-white/40">
                  {initials(top.driverName)}
                </span>
                <span>
                  <span className="block text-xl font-bold">{top.driverName}</span>
                  <span className="block text-2xl font-bold tabular-nums">{formatAriary(top.revenue)}</span>
                </span>
              </Link>
            ) : (
              <p className="mt-6 text-emerald-50">Aucun revenu enregistré sur cette période.</p>
            )}
            {top && top.revenue > 0 && !revenuesLoading && totalRevenue > 0 && (
              <div className="mt-8 space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-emerald-50">
                    <span>Part du chiffre d'affaires</span>
                    <span className="font-semibold tabular-nums">{Math.round((top.revenue / totalRevenue) * 100)} %</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-white" style={{ width: `${(top.revenue / totalRevenue) * 100}%` }} />
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white/10 p-3">
                    <dt className="text-emerald-100">Courses terminées</dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums">
                      {completed.filter((trip) => trip.driver.id === top.driverId).length}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <dt className="text-emerald-100">Commission versée</dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums">
                      {formatAriary(revenues.find((revenue) => revenue.driverId === top.driverId)?.cooperativeFee ?? 0)}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Chiffre d'affaires par chauffeur" description="Données calculées par l'API" />
          <div className="px-2 pt-2 pb-4">
            {loading || revenuesLoading ? (
              <Skeleton className="mx-3 h-56" />
            ) : revenueByDriver.length ? (
              <RevenueBarChart data={revenueByDriver} layout="horizontal" />
            ) : (
              <EmptyState title="Aucun chauffeur" />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader title="Évolution mensuelle" description="Chiffre d'affaires des courses terminées" />
          <div className="px-2 pt-4 pb-4">
            {loading ? <Skeleton className="mx-3 h-56" /> : <RevenueBarChart data={monthly} color="var(--chart-2)" />}
          </div>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader
            title="Dernières courses"
            description="Sur la période sélectionnée"
            actions={
              <Link to="/trips" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                Tout voir →
              </Link>
            }
          />
          <div className="mt-3">
            {loading ? (
              <div className="space-y-3 px-5 pb-5">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : periodTrips.length ? (
              <TripList trips={periodTrips.slice(0, 5)} compact />
            ) : (
              <EmptyState title="Aucune course sur cette période" description="Changez de mois pour voir l'activité." />
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
