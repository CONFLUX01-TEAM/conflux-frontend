import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { POST_SIGN_IN_ROUTE } from '@/features/auth/constants'
import { useAuth } from '@/features/auth/context/auth-context'
import { isSessionExpired } from '@/services/auth.service'

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
