import { ApiError } from '../api/client'

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Votre session a expiré. Reconnectez-vous.'
    return error.message
  }
  return 'Une erreur inattendue est survenue.'
}
