import { createContext } from 'react'
import type { User } from '../api/types'

export interface AuthValue {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthValue | null>(null)
