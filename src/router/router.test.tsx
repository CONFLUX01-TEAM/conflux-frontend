import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/app/App'

const encodeSegment = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '')

/** Builds a structurally valid (unsigned) JWT with the given `exp` claim. */
const makeJwt = (exp: number) =>
  `${encodeSegment({ alg: 'HS256', typ: 'JWT' })}.${encodeSegment({ sub: 'user-1', exp })}.sig`

const storeSession = (exp: number) => {
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
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear()
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

  it('lets a signed-in user reach the dashboard', () => {
    storeSession(Math.floor(Date.now() / 1000) + 3600)

    renderAt('/dashboard')

    expect(screen.getByRole('heading', { name: /welcome, ada lovelace/i })).toBeInTheDocument()
  })

  it('keeps signed-in users out of the sign-in page', () => {
    storeSession(Math.floor(Date.now() / 1000) + 3600)

    renderAt('/signin')

    expect(
      screen.queryByRole('heading', { name: /welcome to conflux hiring/i }),
    ).not.toBeInTheDocument()
  })
})
