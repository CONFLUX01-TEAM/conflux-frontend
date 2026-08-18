import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AuthPanel from '@/features/auth/components/AuthPanel'
import { isApiError, requestPasswordReset } from '@/services/api-client'
import Button from '@/shared/ui/Button'
import InputField from '@/shared/ui/InputField'

const ForgotPasswordForm = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (!email) {
      setFieldError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('Please enter a valid email address')
      return
    }

    setSubmitting(true)
    try {
      const response = await requestPasswordReset(email)
      navigate('/reset-password', {
        state: {
          email,
          notice: response.message || 'If an account exists, a password reset code has been sent.',
        },
      })
    } catch (err) {
      toast.error(
        isApiError(err) && err.message
          ? err.message
          : 'We couldn’t send a reset code. Please try again.',
      )
      setSubmitting(false)
    }
  }

  return (
    <AuthPanel>
      <div className="w-full max-w-[26.63rem] mx-auto flex flex-col items-center text-center">
        <h1 className="font-sans text-2xl sm:text-[2.5rem] md:text-[3rem] text-[#222222] font-medium leading-tight">
          Forgot Password?
        </h1>
        <p className="font-inter text-base sm:text-lg md:text-[1.125rem] text-[#9D9D9D] mt-2">
          Enter your email and we&rsquo;ll send you a 6-digit code to reset it.
        </p>

        <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col mt-4">
          <InputField
            label="Email Address"
            type="email"
            name="email"
            placeholder="Adewaleadebisi@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setFieldError('')
            }}
            disabled={submitting}
            error={!!fieldError}
            errorMessage={fieldError}
          />

          <Button
            type="submit"
            disabled={submitting}
            isLoading={submitting}
            label={submitting ? 'Sending reset code…' : 'Send Reset Code'}
            className={`mt-[1.5rem] bg-[#0D2D54] text-white rounded-[0.5rem] py-[0.91em] font-inter text-base font-medium ${submitting ? 'opacity-80 cursor-wait' : ''}`}
          />
        </form>

        <p className="mt-[2rem] text-center font-inter text-sm sm:text-base text-[#9D9D9D]">
          Remembered your password?{' '}
          <Link to="/signin" className="font-medium text-[#0D2D54]">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthPanel>
  )
}

export default ForgotPasswordForm
