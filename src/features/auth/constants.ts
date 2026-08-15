/** Where users land after a successful sign-in (email/password or Google). */
export const POST_SIGN_IN_ROUTE = '/onboarding'

/**
 * Returns the in-app path to continue to after sign-in: the `from` recorded by
 * the RequireAuth guard when it interrupted navigation, or the default
 * post-sign-in route. Only same-origin absolute paths are honoured.
 */
export const resolvePostSignInPath = (state: unknown): string => {
  if (state && typeof state === 'object' && 'from' in state) {
    const from = (state as { from?: unknown }).from
    if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) {
      return from
    }
  }
  return POST_SIGN_IN_ROUTE
}
