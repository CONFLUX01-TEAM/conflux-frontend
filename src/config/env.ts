// Centralised runtime configuration sourced from Vite env vars.
// Override per-environment via a `.env` file (see `.env.example`).

const DEFAULT_API_BASE_URL = 'https://server-1-919p.onrender.com/api/v1'

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
