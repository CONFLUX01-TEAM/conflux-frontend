import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AuthPanel from '@/features/auth/components/AuthPanel'
import type { AuthRouteState } from '@/features/auth/types'
import { isApiError, resetPassword } from '@/services/api-client'
import Button from '@/shared/ui/Button'
import PasswordInput from '@/shared/ui/PasswordInput'

const ResetPasswordForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = (location.state ?? {}) as AuthRouteState
  const email = routeState.email ?? new URLSearchParams(location.search).get('email') ?? ''
  const otp = routeState.otp ?? new URLSearchParams(location.search).get('otp') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (routeState.notice) {
      toast.info(routeState.notice, { id: 'auth-route-notice' })
    }
  }, [routeState.notice])

  if (!email || !otp) {
    // The reset flow requires an email and verified OTP code first.
    return <Navigate to="/forgot-password" replace />
  }

  const validate = () => {
    const next: Record<string, string> = {}
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
    try {
      await resetPassword(email, otp, password)
      navigate('/signin', {
        replace: true,
        state: { notice: 'Password reset! Login with your new password.' },
      })
    } catch (err) {
      const apiErr = isApiError(err) ? err : null
      const message = apiErr?.message || 'We couldn’t reset your password. Please try again.'
      toast.error(apiErr?.details?.length ? `${message} ${apiErr.details.join('. ')}` : message)
      setSubmitting(false)
    }
  }

  return (
    <AuthPanel>
      <div className="w-full max-w-[26.63rem] mx-auto flex flex-col items-center text-center">
        <h1 className="font-sans text-2xl sm:text-[2.5rem] md:text-[3rem] text-[#222222] font-medium leading-tight">
          Reset Password
        </h1>
        <p className="font-inter text-base sm:text-lg md:text-[1.125rem] text-[#9D9D9D] mt-2 break-words">
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col mt-6 text-left">
          <PasswordInput
            label="New Password"
            name="password"
            placeholder="******"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((prev) => ({ ...prev, password: '' }))
            }}
            disabled={submitting}
            error={!!errors.password}
            errorMessage={errors.password}
          />
          <PasswordInput
            label="Confirm New Password"
            name="confirmPassword"
            placeholder="******"
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
            isLoading={submitting}
            label={submitting ? 'Resetting password…' : 'Reset Password'}
            className={`mt-[1.5rem] bg-[#0D2D54] text-white rounded-[0.5rem] py-[0.91em] font-inter text-base font-medium cursor-pointer ${submitting ? 'opacity-80 cursor-wait' : ''}`}
          />
        </form>

        <p className="mt-6 text-center font-inter text-sm sm:text-base text-[#9D9D9D]">
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

export default ResetPasswordForm
