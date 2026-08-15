export type AuthState = 'signin' | 'signup'

/** Router `location.state` shared across the auth pages. */
export interface AuthRouteState {
  /** Friendly banner shown at the top of the auth card. */
  notice?: string
  /** Path to return to after sign-in (set by the RequireAuth guard). */
  from?: string
  /** Email being verified or reset (verify-email / reset-password pages). */
  email?: string
  /** verify-email only: request a fresh OTP on arrival. */
  needsOtp?: boolean
}

export interface AuthFormProps {
  authState: AuthState
}

/**
 * Lifecycle of the Google Identity Services SDK backing the sign-in button:
 * - `loading` — injecting/initialising the GIS SDK
 * - `ready`   — SDK initialised; the button is interactive
 * - `error`   — SDK failed to load or Google sign-in is not configured
 */
export type GoogleSdkStatus = 'loading' | 'ready' | 'error'

export interface UseGoogleSignInOptions {
  /** Talent sign-in only: UUID of the open job the user is applying through. */
  jobId?: string
  /** Tailors the Google prompt/button copy. */
  context?: 'signin' | 'signup'
}
