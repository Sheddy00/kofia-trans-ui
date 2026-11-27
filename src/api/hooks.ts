import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from './client'
import type { Period, TripFilters, TripStatus, TripUpsertRequest } from './types'

export function useTrips(filters: TripFilters = {}, enabled = true) {
  return useQuery({
    queryKey: ['trips', filters],
    queryFn: () => api.trips(filters),
    enabled,
  })
}

export function useDriverStatistics(driverId: string | undefined) {
  return useQuery({
    queryKey: ['driver-statistics', driverId],
    queryFn: () => api.driverStatistics(driverId!),
    enabled: Boolean(driverId),
  })
}

export function useDriverRevenue(driverId: string | undefined, period: Period | null) {
  return useQuery({
    queryKey: ['driver-revenue', driverId, period],
    queryFn: () => api.driverRevenue(driverId!, period!.from, period!.to),
    enabled: Boolean(driverId && period),
  })
}

export function useDriversRevenue(driverIds: string[], period: Period | null) {
  return useQueries({
    queries: driverIds.map((driverId) => ({
      queryKey: ['driver-revenue', driverId, period],
      queryFn: () => api.driverRevenue(driverId, period!.from, period!.to),
      enabled: Boolean(period),
    })),
  })
}

export function useTopEarningDriver(period: Period | null) {
  return useQuery({
    queryKey: ['top-earning-driver', period],
    queryFn: async () => {
      try {
        return await api.topEarningDriver(period!.from, period!.to)
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
    enabled: Boolean(period),
  })
}

export function useUpsertTrip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tripId, body }: { tripId: string; body: TripUpsertRequest }) => api.upsertTrip(tripId, body),
    onSuccess: () => queryClient.invalidateQueries(),
  })
}

export function useUpdateTripStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tripId, status }: { tripId: string; status: TripStatus }) => api.updateTripStatus(tripId, status),
    onSuccess: () => queryClient.invalidateQueries(),
  })
}
