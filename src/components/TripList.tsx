import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Trip } from '../api/types'
import { formatAriary, formatDate, formatKm } from '../lib/format'
import { StatusBadge } from './ui'

/** Responsive trip list: a table on large screens, stacked cards on small ones. */
export function TripList({
  trips,
  showDriver = true,
  compact = false,
  actions,
}: {
  trips: Trip[]
  showDriver?: boolean
  /** Always use the stacked layout, for narrow cards. */
  compact?: boolean
  actions?: (trip: Trip) => ReactNode
}) {
  return (
    <>
      <div className={compact ? 'hidden' : 'hidden overflow-x-auto md:block'}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase dark:border-slate-800 dark:text-slate-400">
              <th className="px-5 py-3">Course</th>
              <th className="px-3 py-3">Date</th>
              {showDriver && <th className="px-3 py-3">Chauffeur</th>}
              <th className="px-3 py-3">Trajet</th>
              <th className="px-3 py-3 text-right">Distance</th>
              <th className="px-3 py-3 text-right">Montant</th>
              <th className="px-3 py-3">Statut</th>
              {actions && <th className="px-5 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {trips.map((trip) => (
              <tr key={trip.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-5 py-3">
                  <p className="font-medium">{trip.id}</p>
                  <p className="text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">{trip.vehicle.plateNumber}</p>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{formatDate(trip.tripDate)}</td>
                {showDriver && (
                  <td className="px-3 py-3">
                    <Link to={`/drivers/${trip.driver.id}`} className="font-medium hover:text-brand-600 dark:hover:text-brand-400">
                      {trip.driver.name}
                    </Link>
                  </td>
                )}
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    {trip.departureCity}
                    <ArrowRight className="size-3.5 text-slate-400" aria-label="vers" />
                    {trip.arrivalCity}
                  </span>
                </td>
                <td className="px-3 py-3 text-right whitespace-nowrap tabular-nums">{formatKm(trip.distanceKm)}</td>
                <td className="px-3 py-3 text-right font-medium whitespace-nowrap tabular-nums">{formatAriary(trip.billedAmount)}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={trip.status} />
                </td>
                {actions && (
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">{actions(trip)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className={compact ? 'divide-y divide-slate-100 dark:divide-slate-800' : 'divide-y divide-slate-100 md:hidden dark:divide-slate-800'}>
        {trips.map((trip) => (
          <li key={trip.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex flex-wrap items-center gap-x-1.5 font-medium">
                  {trip.departureCity}
                  <ArrowRight className="size-3.5 text-slate-400" aria-label="vers" />
                  {trip.arrivalCity}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {trip.id} · {formatDate(trip.tripDate)} · {formatKm(trip.distanceKm)}
                </p>
                {showDriver && (
                  <Link to={`/drivers/${trip.driver.id}`} className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
                    {trip.driver.name} · {trip.vehicle.plateNumber}
                  </Link>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold whitespace-nowrap tabular-nums">{formatAriary(trip.billedAmount)}</p>
                <div className="mt-1">
                  <StatusBadge status={trip.status} />
                </div>
              </div>
            </div>
            {actions && <div className="mt-3 flex gap-2">{actions(trip)}</div>}
          </li>
        ))}
      </ul>
    </>
  )
}
