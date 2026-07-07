import { createContext, useContext } from 'react'
import type { SessionUser } from '@/services/auth.service'

export interface AuthContextValue {
  /** The signed-in user's profile, or null when signed out. */
  user: SessionUser | null
  isAuthenticated: boolean
  /** Ends the session: best-effort server sign-out, clears storage, routes to sign-in. */
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
