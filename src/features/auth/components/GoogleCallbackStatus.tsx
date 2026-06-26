import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  extractErrorFromRedirect,
  extractTokenFromRedirect,
  setToken,
} from '@/services/auth.service'
import Spinner from '@/shared/ui/Spinner'

const GoogleCallbackStatus = () => {
  const navigate = useNavigate()

  const { token, error } = useMemo(() => {
    const { search, hash } = window.location
    const found = extractTokenFromRedirect(search, hash)
    if (found) return { token: found, error: null as string | null }
    return {
      token: null as string | null,
      error:
        extractErrorFromRedirect(search, hash) ??
        'We could not complete your Google sign-in. Please try again.',
    }
  }, [])

  useEffect(() => {
    if (!token) return
    setToken(token)
    window.history.replaceState(null, '', window.location.pathname)
    navigate('/', { replace: true })
  }, [token, navigate])

  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 px-4">
      {error ? (
        <>
          <h1 className="font-sans text-2xl sm:text-3xl text-[#222222] font-medium">
            Sign-in failed
          </h1>
          <p className="font-inter text-base text-[#9D9D9D] max-w-md break-words">{error}</p>
          <Link to="/signin" className="mt-2 font-inter font-medium text-[#0D2D54] hover:underline">
            Back to sign in
          </Link>
        </>
      ) : (
        <>
          <Spinner className="size-10" />
          <p className="font-inter text-base text-[#9D9D9D]">Completing your Google sign-in…</p>
        </>
      )}
    </div>
  )
}

export default GoogleCallbackStatus
