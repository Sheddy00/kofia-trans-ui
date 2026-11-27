import { useContext } from 'react'
import { AuthContext } from './context'

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}

/** Only administrators may create, edit or cancel trips; the demo account is read-only. */
export function useCanEdit() {
  return useAuth().user?.role === 'ADMIN'
}
