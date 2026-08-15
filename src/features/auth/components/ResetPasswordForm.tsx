import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AuthNotice from '@/features/auth/components/AuthNotice'
import AuthPanel from '@/features/auth/components/AuthPanel'
import OtpInput, { OTP_LENGTH } from '@/features/auth/components/OtpInput'
import type { AuthRouteState } from '@/features/auth/types'
import { useCountdown } from '@/features/auth/hooks/useCountdown'
import { validateOTP } from '@/lib/validation'
import { isApiError, requestPasswordReset, resetPassword } from '@/services/api-client'
import Button from '@/shared/ui/Button'
import InputField from '@/shared/ui/InputField'
import Spinner from '@/shared/ui/Spinner'

const ResetPasswordForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = (location.state ?? {}) as AuthRouteState
  const email = routeState.email ?? new URLSearchParams(location.search).get('email') ?? ''

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState(routeState.notice ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const { secondsLeft, isActive, resetCountdown } = useCountdown(60)

  if (!email) {
    // The reset code is tied to an email — start from the forgot-password step.
    return <Navigate to="/forgot-password" replace />
  }

  const validate = () => {
    const next: Record<string, string> = {}
    const otpError = validateOTP(otp.join(''))
    if (otpError) next.otp = otpError
    if (!password) next.password = 'New password is required'
    else if (password.length < 8) next.password = 'Password must be at least 8 characters'
    if (!confirmPassword) next.confirmPassword = 'Confirm Password is required'
    else if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || !validate()) return

    setSubmitting(true)
    setNotice('')
    try {
      await resetPassword(email, otp.join(''), password)
      navigate('/signin', {
        replace: true,
        state: { notice: 'Password reset! Sign in with your new password.' },
      })
    } catch (err) {
      const apiErr = isApiError(err) ? err : null
      const message = apiErr?.message || 'We couldn’t reset your password. Please try again.'
      toast.error(apiErr?.details?.length ? `${message} ${apiErr.details.join('. ')}` : message)
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (resending) return
    setResending(true)
    setNotice('')
    try {
      const response = await requestPasswordReset(email)
      setOtp(Array(OTP_LENGTH).fill(''))
      setNotice(response.message || 'A new reset code is on its way.')
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
        <p className="font-inter text-base sm:text-lg md:text-[1.125rem] text-[#9D9D9D] mt-2 break-words">
          Enter the 6-digit code sent to {email} and choose a new password.
        </p>

        {notice && (
          <div className="w-full">
            <AuthNotice kind="success">{notice}</AuthNotice>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col mt-6 text-left">
          <OtpInput value={otp} onChange={setOtp} disabled={submitting} />
          {errors.otp && (
            <span className="text-[0.75rem] text-[#EF4444] mt-2 block font-inter text-center">
              {errors.otp}
            </span>
          )}

          <InputField
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="******"
            icon={
              <img
                src={showPassword ? '/show-password.svg' : '/hide-password.svg'}
                alt="Toggle visibility"
                className="size-[1.25rem]"
              />
            }
            onIconClick={() => setShowPassword(!showPassword)}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((prev) => ({ ...prev, password: '' }))
            }}
            disabled={submitting}
            error={!!errors.password}
            errorMessage={errors.password}
          />
          <InputField
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="******"
            icon={
              <img
                src={showConfirmPassword ? '/show-password.svg' : '/hide-password.svg'}
                alt="Toggle visibility"
                className="size-[1.25rem]"
              />
            }
            onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setErrors((prev) => ({ ...prev, confirmPassword: '' }))
            }}
            disabled={submitting}
            error={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword}
          />

          <Button
            type="submit"
            disabled={submitting}
            icon={
              submitting ? (
                <Spinner className="text-white h-4 w-4" wrapperClassName="bg-transparent p-0" />
              ) : undefined
            }
            label={submitting ? 'Resetting password…' : 'Reset Password'}
            className={`mt-[1.5rem] bg-[#0D2D54] text-white rounded-[0.5rem] py-[0.91em] font-inter text-base font-medium ${submitting ? 'opacity-80 cursor-wait' : ''}`}
          />
        </form>

        <div className="mt-[2rem] text-center font-inter text-[0.88rem]">
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
              className="text-[#0D2D54] font-medium hover:underline focus:outline-none disabled:opacity-60"
            >
              {resending ? 'Sending a new code…' : 'Resend code'}
            </button>
          )}
        </div>

        <p className="mt-4 text-center font-inter text-sm sm:text-base text-[#9D9D9D]">
          Remembered your password?{' '}
          <Link to="/signin" className="font-medium text-[#0D2D54]">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthPanel>
  )
}

export default ResetPasswordForm
