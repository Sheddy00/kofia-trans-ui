import type { Period, Trip } from '../api/types'

const pad = (value: number) => String(value).padStart(2, '0')

export const toIsoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export function monthPeriod(year: number, monthIndex: number): Period {
  return {
    from: toIsoDate(new Date(year, monthIndex, 1)),
    to: toIsoDate(new Date(year, monthIndex + 1, 0)),
  }
}

/** Month of the most recent trip, so the default view always shows data. */
export function latestMonthPeriod(trips: Trip[]): Period {
  const latest = trips.reduce<string | null>((max, trip) => (max === null || trip.tripDate > max ? trip.tripDate : max), null)
  const reference = latest ? parseIso(latest) : new Date()
  return monthPeriod(reference.getFullYear(), reference.getMonth())
}

export function shiftMonth(period: Period, delta: number): Period {
  const start = parseIso(period.from)
  return monthPeriod(start.getFullYear(), start.getMonth() + delta)
}

export function isFullMonth(period: Period): boolean {
  const start = parseIso(period.from)
  const full = monthPeriod(start.getFullYear(), start.getMonth())
  return full.from === period.from && full.to === period.to
}

export function periodLabel(period: Period): string {
  if (isFullMonth(period)) {
    const label = parseIso(period.from).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    return label.charAt(0).toUpperCase() + label.slice(1)
  }
  const format = (iso: string) => parseIso(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${format(period.from)} – ${format(period.to)}`
}

export const isInPeriod = (date: string, period: Period) => date >= period.from && date <= period.to

export function parseIso(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

export function monthShortLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
}
