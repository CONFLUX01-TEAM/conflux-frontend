import { API_BASE_URL } from '../config/env';
import { getToken } from './auth';

// ---------------------------------------------------------------------------
// Thin fetch wrapper around the Hiring-AI backend.
// ---------------------------------------------------------------------------

export interface ApiError extends Error {
  status?: number;
}

/**
 * Issue a JSON request against the backend. Attaches the bearer token when one
 * is stored, parses the JSON body, and throws an `ApiError` (with the backend's
 * message, flattening Nest's array-of-messages validation errors) on non-2xx.
 */
const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const raw =
      body && typeof body === 'object' && 'message' in body
        ? (body as { message: unknown }).message
        : null;
    const message = Array.isArray(raw)
      ? raw.join(', ')
      : typeof raw === 'string' && raw
        ? raw
        : `Request failed (${res.status})`;
    const err = new Error(message) as ApiError;
    err.status = res.status;
    throw err;
  }

  return body as T;
};

export interface LoginResponse {
  /** Signed JWT — send as `Authorization: Bearer <token>`. */
  access_token: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

/** POST /auth/login — exchange credentials for a JWT. */
export const login = (email: string, password: string) =>
  request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

/** POST /auth/register — create a LOCAL account. Returns a status message (no token). */
export const register = (name: string, email: string, password: string) =>
  request<MessageResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
