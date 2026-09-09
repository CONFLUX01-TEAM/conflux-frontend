import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AuthPanel from '@/features/auth/components/AuthPanel'
import OtpInput, { OTP_LENGTH } from '@/features/auth/components/OtpInput'
import type { AuthRouteState } from '@/features/auth/types'
import { useCountdown } from '@/features/auth/hooks/useCountdown'
import { validateOTP } from '@/lib/validation'
import { isApiError, requestPasswordReset } from '@/services/api-client'
import Button from '@/shared/ui/Button'

const maskEmail = (email: string) => {
  const [user, domain] = email.split('@')
  if (!user || !domain) return email
  if (user.length <= 2) return `${user[0]}***@${domain}`
  return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`
}

const VerifyResetCodeForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = (location.state ?? {}) as AuthRouteState
  const email = routeState.email ?? new URLSearchParams(location.search).get('email') ?? ''

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const { secondsLeft, isActive, resetCountdown } = useCountdown(60)

  useEffect(() => {
    if (routeState.notice) {
      toast.info(routeState.notice, { id: 'auth-route-notice' })
    }
  }, [routeState.notice])

  if (!email) {
    return <Navigate to="/forgot-password" replace />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join('')
    const otpError = validateOTP(otpValue)
    if (otpError) {
      setError(otpError)
      toast.error(otpError)
      return
    }

    navigate('/reset-password', {
      state: {
        email,
        otp: otpValue,
      },
    })
  }

  const handleResend = async () => {
    if (resending) return
    setResending(true)
    try {
      await requestPasswordReset(email)
      setOtp(Array(OTP_LENGTH).fill(''))
      setError('')
      toast.success(`A new reset code has been sent to ${maskEmail(email)}.`)
      resetCountdown()
    } catch (err) {
      toast.error(
        isApiError(err) && err.message
          ? err.message
          : 'We couldn’t send a new code. Please try again.',
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthPanel>
      <div className="w-full max-w-[26.63rem] mx-auto flex flex-col items-center text-center">
        <h1 className="font-sans text-2xl sm:text-[2.5rem] md:text-[3rem] text-[#222222] font-medium leading-tight">
          Reset Password
        </h1>
        <p className="font-inter text-base sm:text-lg md:text-[1.125rem] text-[#9D9D9D] mt-2 px-2 break-words">
          Enter the 6-digit code sent to {maskEmail(email)}
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col items-center min-w-0 mt-8 sm:mt-10"
        >
          <div className="w-full mb-6">
            <OtpInput
              value={otp}
              onChange={(next) => {
                setOtp(next)
                if (error) setError('')
              }}
            />
            {error && (
              <span className="text-[0.75rem] text-[#EF4444] mt-2 block font-inter text-center">
                {error}
              </span>
            )}
          </div>

          <Button
            type="submit"
            label="Verify Code"
            className="bg-[#0D2D54] text-white rounded-[0.5rem] py-[0.91em] w-full font-inter text-base font-medium cursor-pointer"
          />

          <div className="mt-[2.5rem] text-center font-inter text-[0.88rem]">
            {isActive ? (
              <p className="text-[#9D9D9D]">
                Resend a new code in{' '}
                <span className="text-black font-medium">{secondsLeft} seconds</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-[#0D2D54] font-medium hover:underline focus:outline-none disabled:opacity-60 cursor-pointer"
              >
                {resending ? 'Sending a new code…' : 'Resend code'}
              </button>
            )}
          </div>
        </form>

        <p className="mt-8 text-center font-inter text-sm sm:text-base text-[#9D9D9D]">
          Remember your password?{' '}
          <Link
            to="/signin"
            className="font-medium text-[#0D2D54] hover:opacity-80 hover:underline transition-opacity duration-200 cursor-pointer"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthPanel>
  )
}

export default VerifyResetCodeForm
