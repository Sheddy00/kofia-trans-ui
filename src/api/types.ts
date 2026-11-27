export type TripStatus = 'COMPLETED' | 'CANCELLED'

export interface DriverRef {
  id: string
  name: string
}

export interface VehicleRef {
  id: string
  plateNumber: string
}

export interface Trip {
  id: string
  driver: DriverRef
  vehicle: VehicleRef
  tripDate: string
  departureCity: string
  arrivalCity: string
  distanceKm: number
  billedAmount: number
  status: TripStatus
}

export interface TripUpsertRequest {
  driverId: string
  vehicleId: string
  tripDate: string
  departureCity: string
  arrivalCity: string
  distanceKm: number
  billedAmount: number
}

export interface Revenue {
  driverId: string
  driverName: string
  from: string
  to: string
  revenue: number
  cooperativeFee: number
}

export interface DriverStatistics {
  driverId: string
  driverName: string
  completedTrips: number
  totalDistanceKm: number
  averagePricePerKm: number
}

export interface TopEarningDriver {
  driverId: string
  driverName: string
  revenue: number
}

export interface Period {
  from: string
  to: string
}

export interface TripFilters {
  driverId?: string
  from?: string
  to?: string
}
