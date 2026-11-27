import { useState, type FormEvent } from 'react'
import { useUpsertTrip } from '../api/hooks'
import type { DriverRef, Trip, VehicleRef } from '../api/types'
import { useToast } from './Toast'
import { errorMessage } from '../lib/errors'
import { Button, Field, inputClass } from './ui'

interface FormState {
  id: string
  driverId: string
  vehicleId: string
  tripDate: string
  departureCity: string
  arrivalCity: string
  distanceKm: string
  billedAmount: string
}

type Errors = Partial<Record<keyof FormState, string>>

function validate(form: FormState, existingIds: Set<string>, editing: boolean): Errors {
  const errors: Errors = {}
  if (!form.id.trim()) errors.id = 'Identifiant requis'
  else if (!editing && existingIds.has(form.id.trim())) errors.id = 'Cet identifiant existe déjà'
  if (!form.driverId) errors.driverId = 'Choisissez un chauffeur'
  if (!form.vehicleId) errors.vehicleId = 'Choisissez un véhicule'
  if (!form.tripDate) errors.tripDate = 'Date requise'
  if (!form.departureCity.trim()) errors.departureCity = 'Ville de départ requise'
  if (!form.arrivalCity.trim()) errors.arrivalCity = "Ville d'arrivée requise"
  if (!(Number(form.distanceKm) > 0)) errors.distanceKm = 'Doit être strictement positif'
  if (form.billedAmount === '' || Number(form.billedAmount) < 0) errors.billedAmount = 'Doit être positif ou nul'
  return errors
}

export function TripForm({
  trip,
  suggestedId,
  existingIds,
  drivers,
  vehicles,
  onDone,
}: {
  trip?: Trip
  suggestedId: string
  existingIds: Set<string>
  drivers: DriverRef[]
  vehicles: VehicleRef[]
  onDone: () => void
}) {
  const editing = Boolean(trip)
  const [form, setForm] = useState<FormState>({
    id: trip?.id ?? suggestedId,
    driverId: trip?.driver.id ?? '',
    vehicleId: trip?.vehicle.id ?? '',
    tripDate: trip?.tripDate ?? '',
    departureCity: trip?.departureCity ?? '',
    arrivalCity: trip?.arrivalCity ?? '',
    distanceKm: trip ? String(trip.distanceKm) : '',
    billedAmount: trip ? String(trip.billedAmount) : '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const upsert = useUpsertTrip()
  const notify = useToast()

  const set = (key: keyof FormState) => (event: { target: { value: string } }) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    // Clear the field's error as soon as the user edits it; it is re-checked on submit.
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found = validate(form, existingIds, editing)
    setErrors(found)
    if (Object.keys(found).length) return

    upsert.mutate(
      {
        tripId: form.id.trim(),
        body: {
          driverId: form.driverId,
          vehicleId: form.vehicleId,
          tripDate: form.tripDate,
          departureCity: form.departureCity.trim(),
          arrivalCity: form.arrivalCity.trim(),
          distanceKm: Number(form.distanceKm),
          billedAmount: Number(form.billedAmount),
        },
      },
      {
        onSuccess: (saved) => {
          notify('success', editing ? `Course ${saved.id} mise à jour` : `Course ${saved.id} créée`)
          onDone()
        },
      },
    )
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {upsert.isError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {errorMessage(upsert.error)}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Identifiant" error={errors.id}>
          <input className={inputClass} value={form.id} onChange={set('id')} disabled={editing} />
        </Field>
        <Field label="Date" error={errors.tripDate}>
          <input type="date" className={inputClass} value={form.tripDate} onChange={set('tripDate')} />
        </Field>
        <Field label="Chauffeur" error={errors.driverId}>
          <select className={inputClass} value={form.driverId} onChange={set('driverId')}>
            <option value="">Sélectionner…</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Véhicule" error={errors.vehicleId}>
          <select className={inputClass} value={form.vehicleId} onChange={set('vehicleId')}>
            <option value="">Sélectionner…</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plateNumber}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Départ" error={errors.departureCity}>
          <input className={inputClass} value={form.departureCity} onChange={set('departureCity')} placeholder="Antananarivo" />
        </Field>
        <Field label="Arrivée" error={errors.arrivalCity}>
          <input className={inputClass} value={form.arrivalCity} onChange={set('arrivalCity')} placeholder="Toamasina" />
        </Field>
        <Field label="Distance (km)" error={errors.distanceKm}>
          <input type="number" min={1} inputMode="numeric" className={inputClass} value={form.distanceKm} onChange={set('distanceKm')} />
        </Field>
        <Field label="Montant facturé (Ar)" error={errors.billedAmount}>
          <input type="number" min={0} step={1000} inputMode="numeric" className={inputClass} value={form.billedAmount} onChange={set('billedAmount')} />
        </Field>
      </div>
      {trip?.status === 'CANCELLED' ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          Cette course est annulée : l'enregistrer la remettra au statut « Terminée ».
        </p>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400">La course est enregistrée avec le statut « Terminée ».</p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Annuler
        </Button>
        <Button type="submit" disabled={upsert.isPending}>
          {upsert.isPending ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Créer la course'}
        </Button>
      </div>
    </form>
  )
}
