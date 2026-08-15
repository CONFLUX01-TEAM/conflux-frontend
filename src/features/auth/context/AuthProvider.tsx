import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { OnboardingStatus } from '@/features/auth/context/auth-context'
import type { SessionUser } from '@/services/auth.service'
import { AuthContext } from '@/features/auth/context/auth-context'
import { getEmployerOnboardingStatus, signOut as apiSignOut } from '@/services/api-client'
import {
  AUTH_SESSION_CHANGED_EVENT,
  AUTH_SESSION_EXPIRED_EVENT,
  clearSession,
  getCachedOnboarding,
  getStoredUser,
  hasValidSession,
  isSessionExpired,
  notifySessionExpired,
  setCachedOnboarding,
} from '@/services/auth.service'

const readUser = (): SessionUser | null => (hasValidSession() ? getStoredUser() : null)

/**
 * Synchronous onboarding status from the cache alone — the value used for the
 * first render so routing never flickers. Employers with nothing cached start
 * as `unknown` (the guards show a loader while the server check runs).
 */
const cachedStatus = (
  userId: string | null,
  userType: SessionUser['userType'] | null,
): OnboardingStatus => {
  if (!userId) return 'unknown'
  if (userType !== 'EMPLOYER') return 'complete'
  const cached = getCachedOnboarding(userId)
  if (cached === true) return 'complete'
  if (cached === false) return 'required'
  return 'unknown'
}

/**
 * Owns the client-side auth state. The session itself lives in localStorage
 * (see auth.service); this provider mirrors it into React state and reacts to
 * session events:
 *   - `auth:session-changed` — sign-in/out from anywhere in the app (or another tab)
 *   - `auth:session-expired` — a 401 on an authenticated request, or a token
 *     detected as expired; routes to sign-in with a friendly notice
 *
 * It also resolves the employer onboarding gate: seeded instantly from the
 * per-user cache, then revalidated against `GET /onboarding/employer` so the
 * server stays the source of truth without making the UI wait.
 */
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState<SessionUser | null>(readUser)
  const userId = user?.id ?? null
  const userType = user?.userType ?? null

  // Server-confirmed onboarding result, scoped to the user it was fetched for.
  // Until it lands (or when the user changes) we fall back to the synchronous
  // cache, so the first render is always correct without a flicker.
  const [resolved, setResolved] = useState<{ userId: string; status: OnboardingStatus } | null>(
    null,
  )

  const onboarding: OnboardingStatus =
    resolved && resolved.userId === userId ? resolved.status : cachedStatus(userId, userType)

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

  // Resolve the onboarding gate whenever the account changes: start from the
  // cache (instant, flicker-free) then confirm with the server.
  useEffect(() => {
    if (!userId || userType !== 'EMPLOYER') return

    let cancelled = false
    getEmployerOnboardingStatus()
      .then(({ data }) => {
        if (cancelled) return
        const completed = Boolean(data.completed)
        setCachedOnboarding(userId, completed)
        setResolved({ userId, status: completed ? 'complete' : 'required' })
      })
      .catch(() => {
        // Couldn't confirm (offline, 403, etc.) — fall back to what we know,
        // defaulting an unknown status to showing the form. A finished user
        // just 409s on submit and is routed onward from there.
        if (cancelled) return
        const known = cachedStatus(userId, userType)
        setResolved({ userId, status: known === 'unknown' ? 'required' : known })
      })
    return () => {
      cancelled = true
    }
  }, [userId, userType])

  const signOut = useCallback(async () => {
    try {
      await apiSignOut()
    } catch {
      /* the local session is discarded regardless */
    }
    clearSession()
    navigate('/signin', { replace: true })
  }, [navigate])

  const markOnboardingComplete = useCallback(() => {
    if (!userId) return
    setCachedOnboarding(userId, true)
    setResolved({ userId, status: 'complete' })
  }, [userId])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      signOut,
      onboarding,
      markOnboardingComplete,
    }),
    [user, signOut, onboarding, markOnboardingComplete],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
