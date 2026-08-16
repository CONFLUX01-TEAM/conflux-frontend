import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'

const encodeSegment = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '')

/** Builds a structurally valid (unsigned) JWT with the given `exp` claim. */
const makeJwt = (exp: number) =>
  `${encodeSegment({ alg: 'HS256', typ: 'JWT' })}.${encodeSegment({ sub: 'user-1', exp })}.sig`

const storeSession = (exp: number, onboarded?: boolean) => {
  localStorage.setItem('access_token', makeJwt(exp))
  localStorage.setItem('refresh_token', 'refresh-token')
  localStorage.setItem(
    'auth_user',
    JSON.stringify({
      id: 'user-1',
      fullName: 'Ada Lovelace',
      userType: 'EMPLOYER',
      isEmailVerified: true,
    }),
  )
  if (typeof onboarded === 'boolean') {
    localStorage.setItem(
      'onboarding_status',
      JSON.stringify({ userId: 'user-1', completed: onboarded }),
    )
  }
}

// The AuthProvider revalidates onboarding via GET /onboarding/employer — keep it
// off the network and let each test decide the server's answer.
const stubOnboardingStatus = (completed: boolean) =>
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ statusCode: 200, message: 'ok', data: { completed } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  )

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear()
    stubOnboardingStatus(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('redirects the home route to sign in', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { name: /welcome to conflux hiring/i })).toBeInTheDocument()
  })

  it('blocks the dashboard for signed-out visitors and asks them to sign in', () => {
    renderAt('/dashboard')

    expect(screen.getByRole('heading', { name: /welcome to conflux hiring/i })).toBeInTheDocument()
    expect(screen.getByText(/please sign in to continue/i)).toBeInTheDocument()
  })

  it('sends visitors with an expired token to sign in with a session-expired notice', () => {
    storeSession(Math.floor(Date.now() / 1000) - 60)

    renderAt('/dashboard')

    expect(screen.getByRole('heading', { name: /welcome to conflux hiring/i })).toBeInTheDocument()
    expect(screen.getByText(/session has expired/i)).toBeInTheDocument()
  })

  it('lets an onboarded user reach the dashboard', async () => {
    storeSession(Math.floor(Date.now() / 1000) + 3600, true)

    renderAt('/dashboard')

    expect(await screen.findByRole('heading', { name: /recent candidates/i })).toBeInTheDocument()
  })

  it('routes a not-yet-onboarded employer to the onboarding form', async () => {
    storeSession(Math.floor(Date.now() / 1000) + 3600, false)
    stubOnboardingStatus(false)

    renderAt('/dashboard')

    expect(
      await screen.findByRole('heading', { name: /what is your company called/i }),
    ).toBeInTheDocument()
  })

  it('keeps signed-in users out of the sign-in page', async () => {
    storeSession(Math.floor(Date.now() / 1000) + 3600, true)

    renderAt('/signin')

    expect(await screen.findByRole('heading', { name: /recent candidates/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /welcome to conflux hiring/i }),
    ).not.toBeInTheDocument()
  })
})
