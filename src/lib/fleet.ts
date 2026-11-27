import type { DriverRef, Trip, VehicleRef } from '../api/types'

export const COOPERATIVE_RATE = 0.15

/** The API has no driver/vehicle listing endpoint, so both are derived from the trips. */
export function deriveDrivers(trips: Trip[]): DriverRef[] {
  const byId = new Map<string, DriverRef>()
  for (const trip of trips) byId.set(trip.driver.id, trip.driver)
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export function deriveVehicles(trips: Trip[]): VehicleRef[] {
  const byId = new Map<string, VehicleRef>()
  for (const trip of trips) byId.set(trip.vehicle.id, trip.vehicle)
  return [...byId.values()].sort((a, b) => a.plateNumber.localeCompare(b.plateNumber))
}

export function nextTripId(trips: Trip[]): string {
  const max = trips.reduce((acc, trip) => {
    const match = /^t-(\d+)$/.exec(trip.id)
    return match ? Math.max(acc, Number(match[1])) : acc
  }, 0)
  return `t-${String(max + 1).padStart(3, '0')}`
}

export const isCompleted = (trip: Trip) => trip.status === 'COMPLETED'

export const byDateDesc = (a: Trip, b: Trip) => b.tripDate.localeCompare(a.tripDate) || b.id.localeCompare(a.id)
