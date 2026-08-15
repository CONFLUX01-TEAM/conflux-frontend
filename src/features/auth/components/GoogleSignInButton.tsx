import { useEffect } from 'react'
import { toast } from 'sonner'
import type { UseGoogleSignInOptions } from '@/features/auth/types'
import { useGoogleSignIn } from '@/features/auth/hooks/useGoogleSignIn'
import Spinner from '@/shared/ui/Spinner'

type GoogleSignInButtonProps = UseGoogleSignInOptions

// Stable id so repeated errors (and StrictMode's double-mount) replace a single
// toast instead of stacking duplicates.
const ERROR_TOAST_ID = 'google-signin-error'

/**
 * "Continue with Google" button that keeps the app's visual design while using
 * Google's real (transparent, overlaid) button for the supported popup flow.
 * Handles SDK loading, the in-flight token exchange, and error/retry states.
 */
const GoogleSignInButton = ({ jobId, context = 'signin' }: GoogleSignInButtonProps) => {
  const { sdkStatus, submitting, isBusy, error, canRetry, overlayRef, retry } = useGoogleSignIn({
    jobId,
    context,
  })

  // Surface failures as a toast. A retryable SDK-load error stays open with a
  // "Try again" action; other errors auto-dismiss.
  useEffect(() => {
    if (!error) {
      toast.dismiss(ERROR_TOAST_ID)
      return
    }
    toast.error(error, {
      id: ERROR_TOAST_ID,
      duration: canRetry ? Infinity : undefined,
      action: canRetry ? { label: 'Try again', onClick: retry } : undefined,
    })
  }, [error, canRetry, retry])

  const showOverlay = sdkStatus === 'ready' && !submitting

  const label = submitting
    ? 'Signing you in…'
    : sdkStatus === 'loading'
      ? 'Loading Google…'
      : 'Continue with google'

  return (
    <div className="mb-[1.25rem]">
      <div className="relative">
        {/* Presentational button — the real Google button is overlaid on top. */}
        <div
          aria-hidden={showOverlay}
          className={`pointer-events-none flex w-full select-none items-center justify-center gap-2 rounded-[0.5rem] border-[0.06rem] border-[#E6E6E6] bg-white py-[0.91em] font-inter text-base font-medium text-[#0D2D54] transition-opacity duration-200 ${
            isBusy ? 'opacity-70' : ''
          }`}
        >
          {isBusy ? (
            <Spinner className="text-[#0D2D54]" wrapperClassName="bg-transparent" />
          ) : (
            <img src="/google-icon.svg" alt="" aria-hidden className="size-[1.25rem]" />
          )}
          <span>{label}</span>
        </div>

        {showOverlay && (
          <div
            ref={overlayRef}
            className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[0.5rem] opacity-0"
          />
        )}
      </div>
    </div>
  )
}

export default GoogleSignInButton
