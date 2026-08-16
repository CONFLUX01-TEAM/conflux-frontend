import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '@/features/auth/context/auth-context'
import type { AuthContextValue } from '@/features/auth/context/auth-context'
import OnboardingSteps from '@/features/onboarding/components/OnboardingSteps'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}))

vi.mock('@/services/api-client', () => ({
  uploadCompanyLogo: vi.fn(),
  completeEmployerOnboarding: vi.fn(),
  isApiError: (err: unknown) => err instanceof Error,
}))

interface LayoutProps {
  initialStep: number
  onStepChange?: (step: number) => void
}

const mockAuthValue: AuthContextValue = {
  user: {
    id: 'user-123',
    fullName: 'Test User',
    userType: 'EMPLOYER',
    isEmailVerified: true,
  },
  isAuthenticated: true,
  signOut: vi.fn().mockResolvedValue(undefined),
  onboarding: 'required',
  markOnboardingComplete: vi.fn(),
}

const TestLayout = ({ initialStep, onStepChange }: LayoutProps) => {
  const [step, setStepState] = useState(initialStep)

  const setStep: React.Dispatch<React.SetStateAction<number>> = (action) => {
    setStepState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action
      onStepChange?.(next)
      return next
    })
  }

  return <Outlet context={{ step, setStep }} />
}

const OnboardingTestWrapper = ({
  initialStep = 1,
  onStepChange,
}: {
  initialStep?: number
  onStepChange?: (step: number) => void
}) => {
  return (
    <AuthContext.Provider value={mockAuthValue}>
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route element={<TestLayout initialStep={initialStep} onStepChange={onStepChange} />}>
            <Route path="/onboarding" element={<OnboardingSteps />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('OnboardingSteps', () => {
  it('renders Step 1 (Company Name) and validates empty input on submit', async () => {
    const user = userEvent.setup()
    render(<OnboardingTestWrapper initialStep={1} />)

    expect(screen.getByText('What is your company called?')).toBeInTheDocument()
    const continueBtn = screen.getByRole('button', { name: /continue/i })

    await user.click(continueBtn)
    expect(screen.getByText('Company name is required.')).toBeInTheDocument()
  })

  it('renders Step 1 and advances when a valid company name is entered', async () => {
    const user = userEvent.setup()
    const onStepChange = vi.fn()
    render(<OnboardingTestWrapper initialStep={1} onStepChange={onStepChange} />)

    const input = screen.getByPlaceholderText('e.g Conflux labs')
    await user.type(input, 'Conflux Labs')

    const continueBtn = screen.getByRole('button', { name: /continue/i })
    await user.click(continueBtn)

    expect(screen.queryByText('Company name is required.')).not.toBeInTheDocument()
  })

  it('renders Step 2 (Location) and shows error on empty or invalid format submission', async () => {
    const user = userEvent.setup()
    render(<OnboardingTestWrapper initialStep={2} />)

    expect(screen.getByText('Where are you located?')).toBeInTheDocument()
    const continueBtn = screen.getByRole('button', { name: /continue/i })

    await user.click(continueBtn)
    expect(screen.getByText('Location is required.')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('e.g Abuja, Nigeria')
    await user.type(input, 'Abuja')
    await user.click(continueBtn)
    expect(
      screen.getByText('Please enter location in "State, Country" format (e.g. Abuja, Nigeria).'),
    ).toBeInTheDocument()
  })

  it('renders Step 3 (LinkedIn) and validates invalid URL format', async () => {
    const user = userEvent.setup()
    render(<OnboardingTestWrapper initialStep={3} />)

    expect(screen.getByText("Link your company's Linkedin")).toBeInTheDocument()
    const input = screen.getByPlaceholderText('https://linkedin.com/company/your-company')

    await user.type(input, 'invalid-url')
    const continueBtn = screen.getByRole('button', { name: /continue/i })
    await user.click(continueBtn)

    expect(
      screen.getByText(
        'Please provide a valid LinkedIn company URL (e.g. https://linkedin.com/company/your-company).',
      ),
    ).toBeInTheDocument()
  })

  it('renders Step 4 (Logo) and shows error if no logo is selected', async () => {
    const user = userEvent.setup()
    render(<OnboardingTestWrapper initialStep={4} />)

    expect(screen.getByText('Add your company logo')).toBeInTheDocument()
    const continueBtn = screen.getByRole('button', { name: /continue/i })

    await user.click(continueBtn)
    expect(screen.getByText('Please upload a company logo.')).toBeInTheDocument()
  })

  it('renders Step 4 and shows error if an oversized logo (>2MB) is uploaded', () => {
    render(<OnboardingTestWrapper initialStep={4} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const oversizedFile = new File(['x'.repeat(2 * 1024 * 1024 + 1)], 'big-logo.png', {
      type: 'image/png',
    })

    fireEvent.change(fileInput, { target: { files: [oversizedFile] } })
    expect(screen.getByText('Logo file size must not exceed 2MB.')).toBeInTheDocument()
  })

  it('renders Step 5 (Description) and validates minimum length requirement', async () => {
    const user = userEvent.setup()
    render(<OnboardingTestWrapper initialStep={5} />)

    expect(screen.getByText('Describe what your company does')).toBeInTheDocument()
    const textarea = screen.getByPlaceholderText(/we help growing businesses/i)

    await user.type(textarea, 'Short')
    const finishBtn = screen.getByRole('button', { name: /finish/i })
    await user.click(finishBtn)

    expect(screen.getByText('Description must be at least 10 characters.')).toBeInTheDocument()
  })
})
