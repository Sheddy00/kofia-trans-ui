import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { User } from '../api/types'
import { AuthContext, type AuthValue } from './context'
import { getSession, SESSION_EXPIRED_EVENT, setSession } from './session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(() => getSession()?.user ?? null)

  const logout = useCallback(() => {
    setSession(null)
    setUser(null)
    // Never show one user's cached data to the next one.
    queryClient.clear()
  }, [queryClient])

  const login = useCallback(
    async (username: string, password: string) => {
      const response = await api.login(username, password)
      setSession({ token: response.accessToken, expiresAt: response.expiresAt, user: response.user })
      queryClient.clear()
      setUser(response.user)
    },
    [queryClient],
  )

  // A 401 from the API (expired or revoked token) ends the session everywhere.
  useEffect(() => {
    const onExpired = () => logout()
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [logout])

  // Log out exactly when the token expires, even without any request.
  useEffect(() => {
    const session = getSession()
    if (!user || !session) return
    const delay = Date.parse(session.expiresAt) - Date.now()
    const timer = setTimeout(logout, Math.max(0, Math.min(delay, 2 ** 31 - 1)))
    return () => clearTimeout(timer)
  }, [user, logout])

  const value = useMemo<AuthValue>(() => ({ user, login, logout }), [user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
