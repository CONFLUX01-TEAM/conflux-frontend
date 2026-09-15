import { act, render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GoogleSignInButton from '@/features/auth/components/GoogleSignInButton'

// Hoisted spies so the (hoisted) vi.mock factories below can reference them.
const { googleSignInMock, setSessionMock, navigateMock, toastErrorMock, gis } = vi.hoisted(() => ({
  googleSignInMock: vi.fn(),
  setSessionMock: vi.fn(),
  navigateMock: vi.fn(),
  toastErrorMock: vi.fn(),
  gis: { callback: null as null | ((response: { credential?: string }) => void) },
}))

vi.mock('@/config/env', () => ({
  GOOGLE_CLIENT_ID: 'test-client-id',
  API_BASE_URL: 'http://test/api/v1',
}))

vi.mock('@/services/api-client', () => ({ googleSignIn: googleSignInMock }))
vi.mock('@/services/auth.service', () => ({ setSession: setSessionMock }))
vi.mock('sonner', () => ({
  toast: { error: toastErrorMock, success: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}))

vi.mock('react-router-dom', async (importActual) => ({
  ...(await importActual<typeof import('react-router-dom')>()),
  useNavigate: () => navigateMock,
}))

// Fake GIS SDK: capture the credential callback so tests can fire it.
vi.mock('@/lib/google-identity', () => ({
  loadGoogleIdentity: () =>
    Promise.resolve({
      initialize: (config: GoogleIdConfiguration) => {
        gis.callback = config.callback
      },
      renderButton: () => {},
      prompt: () => {},
      cancel: () => {},
      disableAutoSelect: () => {},
    }),
}))

const renderButton = (jobId?: string) =>
  render(
    <MemoryRouter>
      <GoogleSignInButton jobId={jobId} />
    </MemoryRouter>,
  )

const fireCredential = async (credential: string) => {
  await waitFor(() => expect(gis.callback).toBeTypeOf('function'))
  await act(async () => {
    gis.callback?.({ credential })
  })
}

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    gis.callback = null
  })

  it('exchanges the Google credential, stores the session, and navigates onward', async () => {
    googleSignInMock.mockResolvedValue({
      statusCode: 200,
      message: 'Logged in successfully',
      data: { accessToken: 'access-1', refreshToken: 'refresh-1', userType: 'EMPLOYER' },
    })

    renderButton()
    await fireCredential('google-id-token')

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/onboarding', { replace: true }))
    expect(googleSignInMock).toHaveBeenCalledWith('google-id-token', undefined)
    expect(setSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'access-1', refreshToken: 'refresh-1' }),
    )
  })

  it('forwards jobId when signing in from a job link', async () => {
    googleSignInMock.mockResolvedValue({
      statusCode: 200,
      message: 'Logged in successfully',
      data: { accessToken: 'access-1', refreshToken: 'refresh-1', userType: 'TALENT' },
    })

    renderButton('open-job-uuid')
    await fireCredential('google-id-token')

    await waitFor(() =>
      expect(googleSignInMock).toHaveBeenCalledWith('google-id-token', 'open-job-uuid'),
    )
  })

  it('toasts the backend error message and does not navigate on failure', async () => {
    googleSignInMock.mockRejectedValue(new Error('ID token is invalid or expired'))

    renderButton()
    await fireCredential('google-id-token')

    await waitFor(() =>
      expect(toastErrorMock).toHaveBeenCalledWith(
        'ID token is invalid or expired',
        expect.any(Object),
      ),
    )
    expect(navigateMock).not.toHaveBeenCalled()
    expect(setSessionMock).not.toHaveBeenCalled()
  })
})
