import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AuthNotice from '@/features/auth/components/AuthNotice'
import OtpInput, { OTP_LENGTH } from '@/features/auth/components/OtpInput'
import type { AuthRouteState } from '@/features/auth/types'
import { useCountdown } from '@/features/auth/hooks/useCountdown'
import { validateOTP } from '@/lib/validation'
import { isApiError, sendVerificationOtp, validateVerificationOtp } from '@/services/api-client'
import Button from '@/shared/ui/Button'
import Spinner from '@/shared/ui/Spinner'

/** `jane.doe@acme.com` → `j***e@acme.com` — enough to recognise, safe to display. */
const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.length > 1 ? `${local[0]}***${local[local.length - 1]}` : `${local}***`
  return `${visible}@${domain}`
}

const VerifyEmailForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = (location.state ?? {}) as AuthRouteState
  const email = routeState.email ?? new URLSearchParams(location.search).get('email') ?? ''

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [notice, setNotice] = useState(routeState.notice ?? '')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const { secondsLeft, isActive, resetCountdown } = useCountdown(60)
  // StrictMode mounts effects twice in dev — only auto-send the OTP once.
  const autoSentRef = useRef(false)

  // Users can land here from a sign-in attempt on an unverified account, in
  // which case no code has been emailed yet — request one automatically.
  useEffect(() => {
    if (!routeState.needsOtp || !email || autoSentRef.current) return
    autoSentRef.current = true
    sendVerificationOtp(email).catch(() => {
      /* the visible "Resend OTP" control remains as the fallback */
    })
  }, [routeState.needsOtp, email])

  if (!email) {
    // Nothing to verify without an email — restart the sign-up flow.
    return <Navigate to="/signup" replace />
  }

  const handleAlreadyVerified = () => {
    navigate('/signin', {
      replace: true,
      state: { notice: 'Your email is already verified. Sign in to continue.' },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (verifying) return
    const otpValue = otp.join('')

    const otpError = validateOTP(otpValue)
    if (otpError) {
      toast.error(otpError)
      return
    }

    setVerifying(true)
    setNotice('')
    try {
      await validateVerificationOtp(email, otpValue)
      navigate('/signin', {
        replace: true,
        state: { notice: 'Email verified! Sign in to continue.' },
      })
    } catch (err) {
      const message =
        isApiError(err) && err.message
          ? err.message
          : 'We couldn’t verify that code. Please try again.'
      if (/already verified/i.test(message)) {
        handleAlreadyVerified()
        return
      }
      toast.error(message)
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (resending) return
    setResending(true)
    setNotice('')
    try {
      await sendVerificationOtp(email)
      setOtp(Array(OTP_LENGTH).fill(''))
      setNotice(`A new code is on its way to ${maskEmail(email)}.`)
      resetCountdown()
    } catch (err) {
      const message =
        isApiError(err) && err.message
          ? err.message
          : 'We couldn’t send a new code. Please try again.'
      if (/already verified/i.test(message)) {
        handleAlreadyVerified()
        return
      }
      toast.error(message)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto min-w-0">
      <div className="w-full flex flex-col xl:grid xl:grid-cols-2 gap-6 xl:gap-8 2xl:gap-12 min-w-0 xl:items-stretch">
        <div className="hidden xl:block h-full min-h-0 xl:min-h-[58.25rem]">
          <div className="h-full w-full max-w-[44.75rem] xl:min-h-[58.25rem] rounded-xl overflow-hidden bg-[#0D2D54]">
            <img
              src="/auth-img.svg"
              alt="Conflux Hiring illustration"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <div className="flex flex-col w-full max-w-[42rem] mx-auto xl:mx-0 xl:max-w-none 2xl:max-w-[42rem] h-full xl:min-h-[58.25rem] rounded-[0.94rem] py-6 sm:py-8 px-4 sm:px-8 lg:px-12 xl:px-10 2xl:px-[107px] border-[0.06rem] border-[#E6E6E6] justify-center">
          <div className="flex flex-col items-center text-center w-full min-w-0">
            <h1 className="font-sans text-2xl sm:text-[2.5rem] md:text-[3rem] text-[#222222] font-medium leading-tight">
              Email Verification
            </h1>
            <p className="font-inter text-base sm:text-lg md:text-[1.125rem] text-[#9D9D9D] mt-2 px-2 break-words">
              A verification code has been sent to {maskEmail(email)}
            </p>

            <div className="w-full max-w-[26.63rem] mb-8 sm:mb-[3.5rem]">
              {notice && <AuthNotice kind="success">{notice}</AuthNotice>}
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center min-w-0">
              <div className="w-full mb-8 sm:mb-12">
                <OtpInput value={otp} onChange={setOtp} disabled={verifying} />
              </div>

              <Button
                type="submit"
                disabled={verifying}
                icon={
                  verifying ? (
                    <Spinner className="text-white h-4 w-4" wrapperClassName="bg-transparent p-0" />
                  ) : undefined
                }
                label={verifying ? 'Verifying…' : 'Verify Email'}
                className={`bg-[#0D2D54] text-white rounded-[0.5rem] py-[0.91em] w-full max-w-[26.63rem] font-inter text-base font-medium ${verifying ? 'opacity-80 cursor-wait' : ''}`}
              />

              <div className="mt-[2.5rem] text-center font-inter text-[0.88rem]">
                {isActive ? (
                  <p className="text-[#9D9D9D]">
                    Resend a new otp in{' '}
                    <span className="text-black font-medium">{secondsLeft} seconds</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-[#0D2D54] font-medium hover:underline focus:outline-none disabled:opacity-60"
                  >
                    {resending ? 'Sending a new code…' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailForm
