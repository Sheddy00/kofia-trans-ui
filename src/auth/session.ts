import type { Role } from '../api/types'

export interface Session {
  token: string
  expiresAt: string
  user: { username: string; role: Role }
}

const KEY = 'kofia-trans.session'
export const SESSION_EXPIRED_EVENT = 'kofia-trans:session-expired'

/** Reads the stored session, ignoring it once expired. Storage may be unavailable (private mode). */
export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as Session
    return Date.parse(session.expiresAt) > Date.now() ? session : null
  } catch {
    return null
  }
}

export function saveSession(session: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session))
  } catch {
    // Without storage the session only lasts for this page.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing stored.
  }
}

// Kept in memory as well, so requests still authenticate when storage is unavailable.
let current: Session | null = loadSession()

export const getSession = () => current

export function setSession(session: Session | null) {
  current = session
  if (session) saveSession(session)
  else clearSession()
}
