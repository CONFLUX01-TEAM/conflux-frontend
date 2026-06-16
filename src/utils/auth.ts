import { API_BASE_URL } from '../config/env';

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------
// The backend issues a signed JWT (`access_token`) to be sent as
// `Authorization: Bearer <token>`. We persist it in localStorage so the session
// survives reloads and the OAuth redirect round-trip.

const TOKEN_KEY = 'access_token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable (private mode / quota) — ignore */
  }
};

export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

export const isAuthenticated = (): boolean => Boolean(getToken());

// ---------------------------------------------------------------------------
// Google OAuth
// ---------------------------------------------------------------------------

/** Backend endpoint that kicks off the Google OAuth consent flow. */
export const GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google`;

/**
 * Redirect the browser to the backend's Google OAuth entrypoint. This is a
 * full-page navigation (not fetch) because OAuth requires top-level redirects
 * through Google's consent screen.
 */
export const startGoogleLogin = (): void => {
  window.location.assign(GOOGLE_AUTH_URL);
};

// After the backend handles `/auth/google/callback` it redirects back to the
// frontend with the JWT in the URL. The exact param name isn't contractually
// fixed, so we look for the common spellings in both the query string and the
// hash fragment.
const TOKEN_PARAM_KEYS = ['access_token', 'accessToken', 'token', 'jwt'];
const ERROR_PARAM_KEYS = ['error', 'error_description', 'message'];

const readParams = (raw: string): URLSearchParams => {
  const cleaned = raw.replace(/^[?#]/, '');
  return new URLSearchParams(cleaned);
};

/** Pull the JWT out of the post-OAuth redirect URL, or null if absent. */
export const extractTokenFromRedirect = (search: string, hash: string): string | null => {
  for (const raw of [search, hash]) {
    if (!raw) continue;
    const params = readParams(raw);
    for (const key of TOKEN_PARAM_KEYS) {
      const value = params.get(key);
      if (value) return value;
    }
  }
  return null;
};

/** Pull an error message out of the post-OAuth redirect URL, if the backend reported one. */
export const extractErrorFromRedirect = (search: string, hash: string): string | null => {
  for (const raw of [search, hash]) {
    if (!raw) continue;
    const params = readParams(raw);
    for (const key of ERROR_PARAM_KEYS) {
      const value = params.get(key);
      if (value) return value;
    }
  }
  return null;
};
