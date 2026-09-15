// Centralised runtime configuration sourced from Vite env vars.
// Override per-environment via a `.env` file (see `.env.example`).

const DEFAULT_API_BASE_URL = 'https://backend-maj9.onrender.com/api/v1'

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL

/**
 * Base URL of the Hiring-AI backend, including the `/api/v1` prefix.
 * Trailing slashes are stripped so callers can safely do `${API_BASE_URL}/auth/google`.
 */
export const API_BASE_URL = (
  typeof rawApiBaseUrl === 'string' && rawApiBaseUrl.length > 0
    ? rawApiBaseUrl
    : DEFAULT_API_BASE_URL
).replace(/\/+$/, '')

/**
 * Google OAuth 2.0 **Web client ID** used by the client-side Google Identity
 * Services SDK to obtain an ID token for `POST /auth/google`.
 *
 * This is a public value (safe to ship in the bundle). When it is unset the
 * "Continue with Google" button degrades gracefully into an error state that
 * explains the missing configuration instead of failing silently.
 */
export const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim()
