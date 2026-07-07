import { API_BASE_URL } from '@/config/env'
import { getToken, notifySessionExpired } from '@/services/auth.service'

export interface ApiError extends Error {
  status?: number
  /** Extra validation context from the error envelope's `data.details`. */
  details?: string[]
}

export const isApiError = (err: unknown): err is ApiError => err instanceof Error

const NETWORK_ERROR = 'We couldn’t reach the server. Check your internet connection and try again.'
const SERVER_ERROR = 'Something went wrong on our end. Please try again in a moment.'
const RATE_LIMIT_ERROR = 'Too many attempts. Please wait a moment and try again.'

/** Auth endpoints where a 401 means "bad credentials/OTP", not "session expired". */
const isPublicAuthPath = (path: string): boolean =>
  path.startsWith('/auth/') && path !== '/auth/signout'

/** Pulls `message` + `data.details` out of the `{ statusCode, message, data }` error envelope. */
const parseErrorBody = (body: unknown): { message: string | null; details: string[] } => {
  if (!body || typeof body !== 'object') return { message: null, details: [] }
  const { message, data } = body as { message?: unknown; data?: unknown }

  let details: string[] = []
  if (data && typeof data === 'object' && 'details' in data) {
    const raw = (data as { details: unknown }).details
    if (typeof raw === 'string') details = [raw]
    else if (Array.isArray(raw)) details = raw.filter((d): d is string => typeof d === 'string')
  }

  if (Array.isArray(message)) {
    return { message: message.join(', '), details }
  }
  return { message: typeof message === 'string' && message ? message : null, details }
}

const fallbackMessage = (status: number): string => {
  if (status >= 500) return SERVER_ERROR
  if (status === 429) return RATE_LIMIT_ERROR
  return `Request failed (${status})`
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken()

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    const err = new Error(NETWORK_ERROR) as ApiError
    throw err
  }

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
    // The stored token was rejected — end the session and send the user back
    // to the sign-in page. Public auth endpoints are exempt: a 401 there is
    // feedback about the submitted credentials, not the session.
    if (res.status === 401 && token && !isPublicAuthPath(path)) {
      notifySessionExpired()
    }

    const { message, details } = parseErrorBody(body)
    // 5xx messages ("Internal server error") aren't fit for users — always
    // swap in the friendly copy.
    const err = new Error(
      res.status >= 500 ? SERVER_ERROR : (message ?? fallbackMessage(res.status)),
    ) as ApiError
    err.status = res.status
    if (details.length) err.details = details
    throw err
  }

  return body as T
}

/** Standard `{ statusCode, message, data }` envelope wrapping every API response. */
export interface ApiEnvelope<T> {
  statusCode: number
  message: string
  data: T
}

export type UserType = 'EMPLOYER' | 'TALENT'

/** Job metadata returned for talent sign-ins made through a job link. */
export interface VerifiedJob {
  id: string
  title: string
  roleSlug: string
}

/** Payload of a successful auth response (`data` of the login/Google envelope). */
export interface AuthUser {
  id: string
  fullName: string
  accessToken: string
  refreshToken: string
  userType: UserType
  isEmailVerified: boolean
  /** Talent sign-in only. */
  jobVerified?: boolean
  /** Talent sign-in only. */
  job?: VerifiedJob
}

/** Payload of a successful registration (`data` of the register envelope). */
export interface RegisteredUser {
  id: string
  fullName: string
  email: string
  userType: UserType
  isEmailVerified: boolean
  /** Talent registrations only. */
  jobVerified?: boolean
  /** Talent registrations only. */
  job?: VerifiedJob
  /** Talent registrations only. */
  applicationId?: string
}

/** `data` payload of fire-and-acknowledge auth endpoints (OTP send, password reset, sign-out). */
export interface AuthAck {
  acknowledged: boolean
}

/** `data` payload of a successful OTP validation. */
export interface EmailVerification {
  email?: string
  emailVerified: boolean
}

/** `POST /auth/login` — exchanges credentials for a JWT session. */
export const login = (email: string, password: string) =>
  request<ApiEnvelope<AuthUser>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

/** `POST /auth/register` — creates the account and emails a verification OTP. */
export const register = (fullName: string, email: string, password: string) =>
  request<ApiEnvelope<RegisteredUser>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  })

/** `POST /auth/otp/send` — (re)sends the 6-digit email verification code. */
export const sendVerificationOtp = (email: string) =>
  request<ApiEnvelope<AuthAck>>('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })

/** `POST /auth/otp/validate` — confirms the 6-digit code and marks the email verified. */
export const validateVerificationOtp = (email: string, otp: string) =>
  request<ApiEnvelope<EmailVerification>>('/auth/otp/validate', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  })

/** `POST /auth/password/forgot` — emails a password reset code (rate limited: 429). */
export const requestPasswordReset = (email: string) =>
  request<ApiEnvelope<AuthAck>>('/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })

/** `POST /auth/password/reset` — sets a new password using the emailed reset code. */
export const resetPassword = (email: string, otp: string, newPassword: string) =>
  request<ApiEnvelope<AuthAck>>('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ email, otp, newPassword }),
  })

/** `POST /auth/signout` — invalidates the session server-side (requires bearer token). */
export const signOut = () => request<ApiEnvelope<AuthAck>>('/auth/signout', { method: 'POST' })

/**
 * Exchanges a Google ID token (from the client-side GIS SDK) for the app's JWT
 * session. Provisions an employer account by default; pass `jobId` to sign in a
 * talent through an open job link. Google accounts are treated as verified.
 */
export const googleSignIn = (idToken: string, jobId?: string) =>
  request<ApiEnvelope<AuthUser>>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(jobId ? { idToken, jobId } : { idToken }),
  })
