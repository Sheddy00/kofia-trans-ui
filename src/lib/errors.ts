import { ApiError } from '../api/client'

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return "Clé API refusée. Vérifiez la variable VITE_API_KEY de l'interface."
    return error.message
  }
  return 'Une erreur inattendue est survenue.'
}
