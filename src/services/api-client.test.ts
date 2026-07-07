import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiError } from '@/services/api-client'
import {
  completeEmployerOnboarding,
  getEmployerOnboardingStatus,
  login,
  signOut,
  uploadCompanyLogo,
} from '@/services/api-client'
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

describe('onboarding endpoints', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('access_token', 'employer-token')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uploads the logo as multipart form-data without a JSON content-type', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { statusCode: 200, message: 'ok', data: { logoUrl: 'x' } }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const file = new File(['png-bytes'], 'logo.png', { type: 'image/png' })
    await uploadCompanyLogo(file)

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/onboarding\/employer\/logo$/)
    expect(init.method).toBe('POST')
    expect(init.body).toBeInstanceOf(FormData)
    expect((init.body as FormData).get('logo')).toBe(file)
    const headers = init.headers as Record<string, string>
    expect(headers['Content-Type']).toBeUndefined()
    expect(headers.Authorization).toBe('Bearer employer-token')
  })

  it('completes onboarding with a JSON profile payload', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { statusCode: 200, message: 'ok', data: { completed: true } }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await completeEmployerOnboarding({
      name: 'Conflux Labs',
      location: 'Lagos, Nigeria',
      linkedinUrl: 'https://linkedin.com/company/conflux',
      description: 'We build hiring tools.',
      logoUrl: 'https://cdn/logo.png',
    })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/onboarding\/employer\/complete$/)
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'Conflux Labs',
      location: 'Lagos, Nigeria',
      linkedinUrl: 'https://linkedin.com/company/conflux',
      description: 'We build hiring tools.',
      logoUrl: 'https://cdn/logo.png',
    })
  })

  it('reads onboarding status with a GET', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { statusCode: 200, message: 'ok', data: { completed: false } }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await getEmployerOnboardingStatus()

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/onboarding\/employer$/)
    expect(init.method).toBeUndefined()
  })
})
