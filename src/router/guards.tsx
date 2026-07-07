import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { POST_SIGN_IN_ROUTE } from '@/features/auth/constants'
import { useAuth } from '@/features/auth/context/auth-context'
import { isSessionExpired } from '@/services/auth.service'
import Spinner from '@/shared/ui/Spinner'

/** Full-screen holding state shown while an onboarding decision resolves. */
const GateLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-white">
    <Spinner className="h-8 w-8 text-[#0D2D54]" wrapperClassName="bg-transparent p-0" />
  </div>
)

/**
 * Blocks unauthenticated (or expired-token) visitors and sends them to the
 * sign-in page, remembering where they were headed so sign-in can return them.
 */
export const RequireAuth = () => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const notice = isSessionExpired()
      ? 'Your session has expired. Please sign in again.'
      : 'Please sign in to continue.'
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname + location.search, notice }}
      />
    )
  }

  return <Outlet />
}

/** Keeps already-signed-in users out of the sign-in/sign-up pages. */
export const GuestOnly = () => {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to={POST_SIGN_IN_ROUTE} replace />
  return <Outlet />
}

/**
 * Onboarding-route gate: sends users who have already finished onboarding
 * straight to the dashboard, and holds on a loader (rather than flashing the
 * form) until the cached/server status is known.
 */
export const RequireOnboarding = () => {
  const { onboarding } = useAuth()
  if (onboarding === 'unknown') return <GateLoader />
  if (onboarding === 'complete') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

/** Keeps not-yet-onboarded employers out of the app until onboarding is done. */
export const RequireOnboarded = () => {
  const { onboarding } = useAuth()
  if (onboarding === 'unknown') return <GateLoader />
  if (onboarding === 'required') return <Navigate to="/onboarding" replace />
  return <Outlet />
}
