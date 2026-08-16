import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { GoogleSdkStatus, UseGoogleSignInOptions } from '@/features/auth/types'
import { GOOGLE_CLIENT_ID } from '@/config/env'
import { resolvePostSignInPath } from '@/features/auth/constants'
import { loadGoogleIdentity } from '@/lib/google-identity'
import { googleSignIn } from '@/services/api-client'
import { setSession } from '@/services/auth.service'

const SDK_ERROR = 'We couldn’t load Google sign-in. Check your connection and try again.'
const NOT_CONFIGURED_ERROR = 'Google sign-in is unavailable right now. Please use email instead.'
const GENERIC_AUTH_ERROR = 'We couldn’t sign you in with Google. Please try again.'

export interface UseGoogleSignInResult {
  /** SDK/config readiness. */
  sdkStatus: GoogleSdkStatus
  /** True while the ID token is being exchanged with the backend. */
  submitting: boolean
  /** True whenever the button should show a busy state (loading SDK or signing in). */
  isBusy: boolean
  /** Human-readable error to surface below the button, if any. */
  error: string | null
  /** True when the current error is recoverable by calling `retry()`. */
  canRetry: boolean
  /** Ref callback for the transparent overlay that hosts the real Google button. */
  overlayRef: (element: HTMLDivElement | null) => void
  /** Re-attempts SDK initialisation after a recoverable `error` state. */
  retry: () => void
}

/**
 * Orchestrates the client-side Google sign-in flow:
 *   1. lazily loads + initialises the GIS SDK,
 *   2. renders Google's real (transparent) button into the overlay so clicks use
 *      the supported popup flow while our own button provides the visuals,
 *   3. exchanges the returned ID token via `POST /auth/google`,
 *   4. persists the session and navigates onward.
 *
 * All of loading, config, and network failure surface through `sdkStatus`,
 * `submitting`, and `error`.
 */
export const useGoogleSignIn = ({
  jobId,
  context = 'signin',
}: UseGoogleSignInOptions = {}): UseGoogleSignInResult => {
  const navigate = useNavigate()
  const location = useLocation()

  const isConfigured = Boolean(GOOGLE_CLIENT_ID)
  const [sdkStatus, setSdkStatus] = useState<GoogleSdkStatus>(isConfigured ? 'loading' : 'error')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(isConfigured ? null : NOT_CONFIGURED_ERROR)
  const [attempt, setAttempt] = useState(0)

  const overlayElRef = useRef<HTMLDivElement | null>(null)
  const layoutObserverRef = useRef<ResizeObserver | null>(null)
  const buttonObserverRef = useRef<ResizeObserver | null>(null)
  // Guards against overlapping submissions if Google fires the callback twice.
  const submittingRef = useRef(false)

  const handleCredential = useCallback(
    async (idToken: string) => {
      if (submittingRef.current) return
      submittingRef.current = true
      setSubmitting(true)
      setError(null)
      try {
        const response = await googleSignIn(idToken, jobId)
        setSession(response.data)
        navigate(resolvePostSignInPath(location.state), { replace: true })
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : GENERIC_AUTH_ERROR)
        submittingRef.current = false
        setSubmitting(false)
      }
    },
    [jobId, navigate, location.state],
  )

  // Load + initialise the GIS SDK (re-runs when `retry()` bumps `attempt`).
  // The unconfigured case is handled by the initial state above, so the effect
  // body never sets state synchronously.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false

    loadGoogleIdentity()
      .then((id) => {
        if (cancelled) return
        id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: ({ credential }) => {
            if (credential) handleCredential(credential)
            else setError(GENERIC_AUTH_ERROR)
          },
          ux_mode: 'popup',
          auto_select: false,
          context,
        })
        setSdkStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setSdkStatus('error')
        setError(SDK_ERROR)
      })

    return () => {
      cancelled = true
    }
  }, [attempt, context, handleCredential])

  // Render (or re-render) Google's real button into the transparent overlay,
  // scaled so the entire visual button is a click target regardless of width.
  const renderGoogleButton = useCallback(() => {
    const overlay = overlayElRef.current
    if (!overlay || sdkStatus !== 'ready' || !window.google?.accounts?.id) return

    const overlayWidth = overlay.clientWidth
    const width = Math.min(400, Math.max(200, Math.round(overlayWidth) || 320))

    overlay.replaceChildren()
    const inner = document.createElement('div')
    inner.style.transformOrigin = 'center'
    overlay.appendChild(inner)

    window.google.accounts.id.renderButton(inner, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text: context === 'signup' ? 'signup_with' : 'continue_with',
      logo_alignment: 'center',
      width,
    })

    const applyScale = () => {
      const naturalWidth = inner.offsetWidth
      const naturalHeight = inner.offsetHeight
      if (!naturalWidth || !naturalHeight) return
      const scaleX = overlay.clientWidth / naturalWidth
      const scaleY = overlay.clientHeight / naturalHeight
      inner.style.transform = `scale(${scaleX}, ${scaleY})`
    }

    applyScale()
    // The GIS iframe settles its size asynchronously — recompute when it does.
    buttonObserverRef.current?.disconnect()
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(applyScale)
      observer.observe(inner)
      buttonObserverRef.current = observer
    }
  }, [sdkStatus, context])

  const overlayRef = useCallback(
    (element: HTMLDivElement | null) => {
      layoutObserverRef.current?.disconnect()
      layoutObserverRef.current = null
      buttonObserverRef.current?.disconnect()
      buttonObserverRef.current = null
      overlayElRef.current = element
      if (!element) return

      renderGoogleButton()
      if (typeof ResizeObserver !== 'undefined') {
        // Re-render at the new pixel width when the layout reflows.
        const observer = new ResizeObserver(() => renderGoogleButton())
        observer.observe(element)
        layoutObserverRef.current = observer
      }
    },
    [renderGoogleButton],
  )

  useEffect(
    () => () => {
      layoutObserverRef.current?.disconnect()
      buttonObserverRef.current?.disconnect()
    },
    [],
  )

  const retry = useCallback(() => {
    // A missing client ID cannot be fixed by retrying — keep the error visible.
    if (!GOOGLE_CLIENT_ID) return
    setError(null)
    setSdkStatus('loading')
    setAttempt((value) => value + 1)
  }, [])

  return {
    sdkStatus,
    submitting,
    isBusy: sdkStatus === 'loading' || submitting,
    error,
    canRetry: sdkStatus === 'error' && isConfigured,
    overlayRef,
    retry,
  }
}
