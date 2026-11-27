import { Eye, Pencil, Plus, RotateCcw, Search, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useTrips, useUpdateTripStatus } from '../api/hooks'
import { useCanEdit } from '../auth/useAuth'
import type { Trip, TripStatus } from '../api/types'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'
import { TripForm } from '../components/TripForm'
import { TripList } from '../components/TripList'
import { Button, Card, EmptyState, ErrorState, PageHeader, Skeleton, SlowServerNotice, inputClass } from '../components/ui'
import { cx } from '../lib/cx'
import { errorMessage } from '../lib/errors'
import { byDateDesc, deriveDrivers, deriveVehicles, nextTripId } from '../lib/fleet'
import { formatAriary } from '../lib/format'

const STATUS_FILTERS: Array<{ value: TripStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Toutes' },
  { value: 'COMPLETED', label: 'Terminées' },
  { value: 'CANCELLED', label: 'Annulées' },
]

export function TripsPage() {
  const [params, setParams] = useSearchParams()
  const driverId = params.get('driverId') ?? ''
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const [status, setStatus] = useState<TripStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Trip | 'new' | null>(null)

  const periodIncomplete = Boolean(from) !== Boolean(to)
  const allTrips = useTrips()
  const filtered = useTrips(
    { driverId: driverId || undefined, from: from || undefined, to: to || undefined },
    !periodIncomplete,
  )
  const updateStatus = useUpdateTripStatus()
  const notify = useToast()
  const canEdit = useCanEdit()

  const all = useMemo(() => allTrips.data ?? [], [allTrips.data])
  const drivers = useMemo(() => deriveDrivers(all), [all])
  const vehicles = useMemo(() => deriveVehicles(all), [all])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (filtered.data ?? [])
      .filter((trip) => status === 'ALL' || trip.status === status)
      .filter(
        (trip) =>
          !term ||
          [trip.id, trip.departureCity, trip.arrivalCity, trip.driver.name, trip.vehicle.plateNumber].some((value) =>
            value.toLowerCase().includes(term),
          ),
      )
      .sort(byDateDesc)
  }, [filtered.data, status, search])

  const total = visible.filter((trip) => trip.status === 'COMPLETED').reduce((sum, trip) => sum + trip.billedAmount, 0)

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const toggleStatus = (trip: Trip) => {
    const nextStatus: TripStatus = trip.status === 'COMPLETED' ? 'CANCELLED' : 'COMPLETED'
    updateStatus.mutate(
      { tripId: trip.id, status: nextStatus },
      {
        onSuccess: () => notify('success', nextStatus === 'CANCELLED' ? `Course ${trip.id} annulée` : `Course ${trip.id} rétablie`),
        onError: (error) => notify('error', errorMessage(error)),
      },
    )
  }

  const hasFilters = Boolean(driverId || from || to || search || status !== 'ALL')

  return (
    <>
      <PageHeader
        title="Courses"
        description={
          canEdit
            ? 'Consultez, créez et mettez à jour les courses de la coopérative.'
            : 'Consultez les courses de la coopérative.'
        }
        actions={
          canEdit && (
            <Button onClick={() => setEditing('new')} disabled={!allTrips.data}>
              <Plus className="size-4" aria-hidden /> Nouvelle course
            </Button>
          )
        }
      />
      {!canEdit && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <Eye className="size-4 shrink-0" aria-hidden />
          Compte en lecture seule : la création et la modification des courses sont réservées aux administrateurs.
        </div>
      )}
      <SlowServerNotice loading={filtered.isPending && !periodIncomplete} />

      <Card className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1.4fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Rechercher une ville, un chauffeur, une plaque…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Rechercher"
            />
          </div>
          <select className={inputClass} value={driverId} onChange={(event) => setParam('driverId', event.target.value)} aria-label="Chauffeur">
            <option value="">Tous les chauffeurs</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
          <input type="date" className={inputClass} value={from} max={to || undefined} onChange={(event) => setParam('from', event.target.value)} aria-label="Du" />
          <input type="date" className={inputClass} value={to} min={from || undefined} onChange={(event) => setParam('to', event.target.value)} aria-label="Au" />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="Statut">
            {STATUS_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                aria-pressed={status === option.value}
                className={cx(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition',
                  status === option.value
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {periodIncomplete ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">Renseignez les deux dates pour filtrer par période.</p>
          ) : (
            hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setParams({}, { replace: true })
                  setSearch('')
                  setStatus('ALL')
                }}
              >
                Réinitialiser les filtres
              </Button>
            )
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        {filtered.isError ? (
          <ErrorState error={filtered.error} onRetry={() => filtered.refetch()} />
        ) : filtered.isPending ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title="Aucune course trouvée"
            description={hasFilters ? 'Essayez de modifier vos filtres.' : 'Créez votre première course.'}
          />
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 text-sm dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">
                {visible.length} course{visible.length > 1 ? 's' : ''}
              </span>
              <span>
                <span className="text-slate-500 dark:text-slate-400">Terminées : </span>
                <span className="font-semibold tabular-nums">{formatAriary(total)}</span>
              </span>
            </div>
            <TripList
              trips={visible}
              actions={canEdit ? (trip) => (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(trip)} aria-label={`Modifier ${trip.id}`}>
                    <Pencil className="size-4" aria-hidden />
                    <span className="md:sr-only">Modifier</span>
                  </Button>
                  <Button
                    variant={trip.status === 'COMPLETED' ? 'danger' : 'ghost'}
                    size="sm"
                    disabled={updateStatus.isPending && updateStatus.variables?.tripId === trip.id}
                    onClick={() => toggleStatus(trip)}
                    aria-label={trip.status === 'COMPLETED' ? `Annuler ${trip.id}` : `Rétablir ${trip.id}`}
                  >
                    {trip.status === 'COMPLETED' ? <XCircle className="size-4" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}
                    <span className="md:sr-only">{trip.status === 'COMPLETED' ? 'Annuler' : 'Rétablir'}</span>
                  </Button>
                </>
              ) : undefined}
            />
          </>
        )}
      </Card>

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'Nouvelle course' : `Modifier la course ${editing?.id ?? ''}`}
        onClose={() => setEditing(null)}
      >
        <TripForm
          key={editing === 'new' ? 'new' : editing?.id}
          trip={editing && editing !== 'new' ? editing : undefined}
          suggestedId={nextTripId(all)}
          existingIds={new Set(all.map((trip) => trip.id))}
          drivers={drivers}
          vehicles={vehicles}
          onDone={() => setEditing(null)}
        />
      </Modal>
    </>
  )
}
