import type { Trip } from '../api/types'
import { isCompleted } from './fleet'
import { monthKey, monthShortLabel } from './period'
import type { ChartDatum } from '../components/charts'

/** Monthly revenue of completed trips, with empty months filled in between the first and last month. */
export function monthlyRevenue(trips: Trip[]): ChartDatum[] {
  const totals = new Map<string, number>()
  for (const trip of trips.filter(isCompleted)) {
    const key = monthKey(trip.tripDate)
    totals.set(key, (totals.get(key) ?? 0) + trip.billedAmount)
  }
  const keys = [...totals.keys()].sort()
  if (keys.length === 0) return []

  const result: ChartDatum[] = []
  let [year, month] = keys[0]!.split('-').map(Number) as [number, number]
  const last = keys[keys.length - 1]!
  for (;;) {
    const key = `${year}-${String(month).padStart(2, '0')}`
    result.push({ label: monthShortLabel(key), value: totals.get(key) ?? 0 })
    if (key === last) break
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }
  return result
}
