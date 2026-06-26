import { API_BASE_URL } from '@/config/env'

const TOKEN_KEY = 'access_token'

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

export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export const isAuthenticated = (): boolean => Boolean(getToken())

export const GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google`

export const startGoogleLogin = (): void => {
  window.location.assign(GOOGLE_AUTH_URL)
}

const TOKEN_PARAM_KEYS = ['access_token', 'accessToken', 'token', 'jwt']
const ERROR_PARAM_KEYS = ['error', 'error_description', 'message']

const readParams = (raw: string): URLSearchParams => {
  const cleaned = raw.replace(/^[?#]/, '')
  return new URLSearchParams(cleaned)
}

export const extractTokenFromRedirect = (search: string, hash: string): string | null => {
  for (const raw of [search, hash]) {
    if (!raw) continue
    const params = readParams(raw)
    for (const key of TOKEN_PARAM_KEYS) {
      const value = params.get(key)
      if (value) return value
    }
  }
  return null
}

export const extractErrorFromRedirect = (search: string, hash: string): string | null => {
  for (const raw of [search, hash]) {
    if (!raw) continue
    const params = readParams(raw)
    for (const key of ERROR_PARAM_KEYS) {
      const value = params.get(key)
      if (value) return value
    }
  }
  return null
}
