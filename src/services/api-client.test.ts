import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiError } from '@/services/api-client'
import { login, signOut } from '@/services/api-client'
import { AUTH_SESSION_EXPIRED_EVENT } from '@/services/auth.service'

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const errorEnvelope = (statusCode: number, message: string, details?: string[]) => ({
  statusCode,
  message,
  data: details ? { details } : {},
})

describe('api-client', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('unwraps successful responses', async () => {
    const envelope = { statusCode: 200, message: 'Logged in successfully', data: { id: 'u1' } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, envelope)))

    await expect(login('ada@acme.com', 'Secret123!')).resolves.toEqual(envelope)
  })

  it('surfaces the backend error message with status and details', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(400, errorEnvelope(400, 'Validation failed', ['password too short'])),
        ),
    )

    const err = (await login('ada@acme.com', 'x').catch((e: unknown) => e)) as ApiError
    expect(err.message).toBe('Validation failed')
    expect(err.status).toBe(400)
    expect(err.details).toEqual(['password too short'])
  })

  it('does not end the session when a sign-in attempt is rejected', async () => {
    localStorage.setItem('access_token', 'stale-token')
    const expiredSpy = vi.fn()
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, expiredSpy)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(401, errorEnvelope(401, 'Invalid credentials'))),
    )

    await expect(login('ada@acme.com', 'wrong')).rejects.toThrow('Invalid credentials')
    expect(expiredSpy).not.toHaveBeenCalled()
    expect(localStorage.getItem('access_token')).toBe('stale-token')
    window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, expiredSpy)
  })

  it('ends the session when an authenticated request comes back 401', async () => {
    localStorage.setItem('access_token', 'expired-token')
    const expiredSpy = vi.fn()
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, expiredSpy)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(401, errorEnvelope(401, 'Access token is expired'))),
    )

    await expect(signOut()).rejects.toThrow('Access token is expired')
    expect(expiredSpy).toHaveBeenCalledOnce()
    expect(localStorage.getItem('access_token')).toBeNull()
    window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, expiredSpy)
  })

  it('turns network failures into a human-friendly message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(login('ada@acme.com', 'Secret123!')).rejects.toThrow(
      'We couldn’t reach the server. Check your internet connection and try again.',
    )
  })
})
