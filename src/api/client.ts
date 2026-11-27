import type {
  DriverStatistics,
  Revenue,
  TopEarningDriver,
  Trip,
  TripFilters,
  TripStatus,
  TripUpsertRequest,
} from './types'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8081').replace(/\/$/, '')
const API_KEY = import.meta.env.VITE_API_KEY ?? ''

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'x-api-key': API_KEY }
  if (init.body) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(API_URL + path, { ...init, headers })
  } catch {
    throw new ApiError(0, "Impossible de joindre l'API. Vérifiez votre connexion puis réessayez.")
  }

  const text = await response.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : `Erreur ${response.status}`
    throw new ApiError(response.status, message)
  }
  return data as T
}

function queryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  const result = search.toString()
  return result ? `?${result}` : ''
}

const segment = encodeURIComponent

export const api = {
  trips: (filters: TripFilters = {}) => request<Trip[]>(`/trips${queryString({ ...filters })}`),

  upsertTrip: (tripId: string, body: TripUpsertRequest) =>
    request<Trip>(`/trips/${segment(tripId)}`, { method: 'PUT', body: JSON.stringify(body) }),

  updateTripStatus: (tripId: string, status: TripStatus) =>
    request<Trip>(`/trips/${segment(tripId)}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  driverRevenue: (driverId: string, from: string, to: string) =>
    request<Revenue>(`/drivers/${segment(driverId)}/revenue${queryString({ from, to })}`),

  driverStatistics: (driverId: string) => request<DriverStatistics>(`/drivers/${segment(driverId)}/statistics`),

  topEarningDriver: (from: string, to: string) =>
    request<TopEarningDriver>(`/statistics/top-earning-driver${queryString({ from, to })}`),
}
