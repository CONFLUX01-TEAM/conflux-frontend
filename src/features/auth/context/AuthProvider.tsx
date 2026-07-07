import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { SessionUser } from '@/services/auth.service'
import { AuthContext } from '@/features/auth/context/auth-context'
import { signOut as apiSignOut } from '@/services/api-client'
import {
  AUTH_SESSION_CHANGED_EVENT,
  AUTH_SESSION_EXPIRED_EVENT,
  clearSession,
  getStoredUser,
  hasValidSession,
  isSessionExpired,
  notifySessionExpired,
} from '@/services/auth.service'

const readUser = (): SessionUser | null => (hasValidSession() ? getStoredUser() : null)

/**
 * Owns the client-side auth state. The session itself lives in localStorage
 * (see auth.service); this provider mirrors it into React state and reacts to
 * session events:
 *   - `auth:session-changed` — sign-in/out from anywhere in the app (or another tab)
 *   - `auth:session-expired` — a 401 on an authenticated request, or a token
 *     detected as expired; routes to sign-in with a friendly notice
 */
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState<SessionUser | null>(readUser)

  useEffect(() => {
    const syncFromStorage = () => setUser(readUser())
    const onExpired = () => {
      setUser(null)
      navigate('/signin', {
        replace: true,
        state: { notice: 'Your session has expired. Please sign in again.' },
      })
    }

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, syncFromStorage)
    window.addEventListener('storage', syncFromStorage)
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onExpired)
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, syncFromStorage)
      window.removeEventListener('storage', syncFromStorage)
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onExpired)
    }
  }, [navigate])

  // Catch tokens that expire while the app is open (or in a background tab).
  useEffect(() => {
    const check = () => {
      if (isSessionExpired()) notifySessionExpired()
    }
    check()
    const interval = window.setInterval(check, 60_000)
    window.addEventListener('focus', check)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', check)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await apiSignOut()
    } catch {
      /* the local session is discarded regardless */
    }
    clearSession()
    navigate('/signin', { replace: true })
  }, [navigate])

  const value = useMemo(() => ({ user, isAuthenticated: user !== null, signOut }), [user, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
