import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiError } from '@/services/api-client'
import AuthForm from '@/features/auth/components/AuthForm'

const { loginMock, registerMock, setSessionMock, navigateMock, toastErrorMock } = vi.hoisted(
  () => ({
    loginMock: vi.fn(),
    registerMock: vi.fn(),
    setSessionMock: vi.fn(),
    navigateMock: vi.fn(),
    toastErrorMock: vi.fn(),
  }),
)

vi.mock('@/services/api-client', () => ({
  login: loginMock,
  register: registerMock,
  googleSignIn: vi.fn(),
  isApiError: (err: unknown) => err instanceof Error,
}))

vi.mock('@/services/auth.service', () => ({ setSession: setSessionMock }))

vi.mock('sonner', () => ({
  toast: { error: toastErrorMock, success: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}))

vi.mock('react-router-dom', async (importActual) => ({
  ...(await importActual<typeof import('react-router-dom')>()),
  useNavigate: () => navigateMock,
}))

const apiError = (message: string, status: number): ApiError => {
  const err = new Error(message) as ApiError
  err.status = status
  return err
}

const renderForm = (authState: 'signin' | 'signup') =>
  render(
    <MemoryRouter>
      <AuthForm authState={authState} />
    </MemoryRouter>,
  )

// The signin/signup tab toggle shares its accessible name with the submit
// button, so target the form's actual submit control.
const submitButton = (name: RegExp) =>
  screen
    .getAllByRole('button', { name })
    .find((button) => button.getAttribute('type') === 'submit') as HTMLElement

const employer = {
  id: 'user-1',
  fullName: 'Ada Lovelace',
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  userType: 'EMPLOYER',
  isEmailVerified: true,
}

describe('AuthForm sign in', () => {
  beforeEach(() => vi.clearAllMocks())

  it('stores the session and navigates onward on success', async () => {
    loginMock.mockResolvedValue({ statusCode: 200, message: 'ok', data: employer })
    const user = userEvent.setup()
    renderForm('signin')

    await user.type(screen.getByLabelText(/email address/i), 'ada@acme.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Secret123!')
    await user.click(submitButton(/^sign in$/i))

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/onboarding', { replace: true }))
    expect(loginMock).toHaveBeenCalledWith('ada@acme.com', 'Secret123!')
    expect(setSessionMock).toHaveBeenCalledWith(employer)
  })

  it('toasts the backend message when credentials are wrong', async () => {
    loginMock.mockRejectedValue(apiError('Email/password combination is incorrect', 401))
    const user = userEvent.setup()
    renderForm('signin')

    await user.type(screen.getByLabelText(/email address/i), 'ada@acme.com')
    await user.type(screen.getByLabelText(/^password$/i), 'wrong-pass')
    await user.click(submitButton(/^sign in$/i))

    await waitFor(() =>
      expect(toastErrorMock).toHaveBeenCalledWith('Email/password combination is incorrect'),
    )
    expect(navigateMock).not.toHaveBeenCalled()
    expect(setSessionMock).not.toHaveBeenCalled()
  })

  it('routes unverified accounts to email verification', async () => {
    loginMock.mockRejectedValue(apiError('Account exists but email is not verified yet', 401))
    const user = userEvent.setup()
    renderForm('signin')

    await user.type(screen.getByLabelText(/email address/i), 'ada@acme.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Secret123!')
    await user.click(submitButton(/^sign in$/i))

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith('/verify-email', {
        state: expect.objectContaining({ email: 'ada@acme.com', needsOtp: true }),
      }),
    )
  })
})

describe('AuthForm sign up', () => {
  beforeEach(() => vi.clearAllMocks())

  it('registers the account and continues to email verification', async () => {
    registerMock.mockResolvedValue({ statusCode: 201, message: 'ok', data: {} })
    const user = userEvent.setup()
    renderForm('signup')

    await user.type(screen.getByLabelText(/full name/i), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/email address/i), 'ada@acme.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Secret123!')
    await user.type(screen.getByLabelText(/confirm password/i), 'Secret123!')
    await user.click(submitButton(/^signup$/i))

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith('/verify-email', {
        state: expect.objectContaining({ email: 'ada@acme.com' }),
      }),
    )
    expect(registerMock).toHaveBeenCalledWith('Ada Lovelace', 'ada@acme.com', 'Secret123!')
  })

  it('points duplicate emails at the sign-in flow', async () => {
    registerMock.mockRejectedValue(apiError('Email is already registered', 409))
    const user = userEvent.setup()
    renderForm('signup')

    await user.type(screen.getByLabelText(/full name/i), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/email address/i), 'ada@acme.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Secret123!')
    await user.type(screen.getByLabelText(/confirm password/i), 'Secret123!')
    await user.click(submitButton(/^signup$/i))

    await waitFor(() =>
      expect(
        screen.getByText(/this email is already registered\. try signing in instead\./i),
      ).toBeInTheDocument(),
    )
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
