import { API_BASE_URL } from '@/config/env'
import { getToken } from '@/services/auth.service'

export interface ApiError extends Error {
  status?: number
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!res.ok) {
    const raw =
      body && typeof body === 'object' && 'message' in body
        ? (body as { message: unknown }).message
        : null
    const message = Array.isArray(raw)
      ? raw.join(', ')
      : typeof raw === 'string' && raw
        ? raw
        : `Request failed (${res.status})`
    const err = new Error(message) as ApiError
    err.status = res.status
    throw err
  }

  return body as T
}

export interface LoginResponse {
  access_token: string
}

export interface MessageResponse {
  success: boolean
  message: string
}

export const login = (email: string, password: string) =>
  request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const register = (name: string, email: string, password: string) =>
  request<MessageResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
