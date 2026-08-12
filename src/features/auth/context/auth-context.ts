import { createContext, useContext } from 'react'
import type { SessionUser } from '@/services/auth.service'

/**
 * Employer-onboarding gate:
 * - `unknown`  — not resolved yet; show a loader rather than guessing a screen
 * - `required` — onboarding is not finished; the user belongs on /onboarding
 * - `complete` — onboarding done (non-employer accounts are always `complete`)
 */
export type OnboardingStatus = 'unknown' | 'required' | 'complete'

export interface AuthContextValue {
  /** The signed-in user's profile, or null when signed out. */
  user: SessionUser | null
  isAuthenticated: boolean
  /** Ends the session: best-effort server sign-out, clears storage, routes to sign-in. */
  signOut: () => Promise<void>
  /** Cached-then-server-revalidated onboarding gate used by the route guards. */
  onboarding: OnboardingStatus
  /** Optimistically marks onboarding complete once the flow succeeds. */
  markOnboardingComplete: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
