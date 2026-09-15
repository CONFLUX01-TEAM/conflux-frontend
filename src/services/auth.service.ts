import type { AuthUser } from '@/services/api-client'

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'auth_user'
const ONBOARDING_KEY = 'onboarding_status'

/**
 * Dispatched on `window` whenever the stored session changes (sign-in,
 * sign-out, or clearing). The AuthProvider listens so React state stays in
 * sync no matter which module touched the session.
 */
export const AUTH_SESSION_CHANGED_EVENT = 'auth:session-changed'

/**
 * Dispatched on `window` when the backend rejects the stored token (401) or
 * the token is detected as expired. The AuthProvider redirects to the sign-in
 * page with a friendly notice.
 */
export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired'

/** User profile persisted with the session (tokens are stored separately). */
export interface SessionUser {
  id: string
  fullName: string
  userType: AuthUser['userType']
  isEmailVerified: boolean
}

const dispatch = (eventName: string): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(eventName))
  }
}

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* storage unavailable */
  }
}

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

/** Returns the persisted user profile, or null when signed out. */
export const getStoredUser = (): SessionUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionUser
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

/**
 * Cached employer-onboarding completion flag, keyed by user id so a different
 * account on the same device never reuses a stale value. Lets the app make an
 * instant, flicker-free routing decision while the server check revalidates.
 * Returns null when nothing is cached for this user.
 */
export const getCachedOnboarding = (userId: string): boolean | null => {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { userId?: string; completed?: boolean }
    return parsed?.userId === userId && typeof parsed.completed === 'boolean'
      ? parsed.completed
      : null
  } catch {
    return null
  }
}

export const setCachedOnboarding = (userId: string, completed: boolean): void => {
  try {
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify({ userId, completed }))
  } catch {
    /* storage unavailable */
  }
}

/** Persists the JWT session + user profile returned by login / Google sign-in. */
export const setSession = (user: AuthUser): void => {
  setToken(user.accessToken)
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, user.refreshToken)
    const profile: SessionUser = {
      id: user.id,
      fullName: user.fullName,
      userType: user.userType,
      isEmailVerified: user.isEmailVerified,
    }
    localStorage.setItem(USER_KEY, JSON.stringify(profile))
  } catch {
    /* storage unavailable */
  }
  dispatch(AUTH_SESSION_CHANGED_EVENT)
}

/** Clears the stored session (tokens + user profile). */
export const clearSession = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(ONBOARDING_KEY)
  } catch {
    /* ignore */
  }
  dispatch(AUTH_SESSION_CHANGED_EVENT)
}

/** @deprecated Use {@link clearSession}. */
export const clearToken = clearSession

/** Reads the `exp` claim (seconds since epoch) from a JWT, if present. */
const decodeJwtExp = (token: string): number | null => {
  try {
    const payload = token.split('.')[1]
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: unknown
    }
    return typeof json.exp === 'number' ? json.exp : null
  } catch {
    return null
  }
}

/**
 * True when a token exists but its `exp` claim is in the past. Tokens without
 * a readable `exp` are given the benefit of the doubt — the backend's 401
 * remains the source of truth.
 */
export const isSessionExpired = (): boolean => {
  const token = getToken()
  if (!token) return false
  const exp = decodeJwtExp(token)
  return exp !== null && exp * 1000 <= Date.now()
}

/** True when an access token is stored and not (detectably) expired. */
export const hasValidSession = (): boolean => Boolean(getToken()) && !isSessionExpired()

export const isAuthenticated = (): boolean => hasValidSession()

/**
 * Clears the session and broadcasts {@link AUTH_SESSION_EXPIRED_EVENT} so the
 * app can route the user back to the sign-in page. Called by the API client
 * when an authenticated request comes back 401.
 */
export const notifySessionExpired = (): void => {
  clearSession()
  dispatch(AUTH_SESSION_EXPIRED_EVENT)
}
