import { useEffect, useState } from 'react'

/**
 * Keeps the last non-null `value` rendered for `exitMs` after it is cleared, so
 * a surface can play its exit animation before it unmounts.
 */
export function usePresence<T>(value: T | null, exitMs: number) {
  const [rendered, setRendered] = useState<T | null>(value)

  // Adopt a new value during render so the entering frame is never skipped.
  if (value !== null && value !== rendered) {
    setRendered(value)
  }

  useEffect(() => {
    if (value !== null || rendered === null) return
    const timeout = window.setTimeout(() => setRendered(null), exitMs)
    return () => window.clearTimeout(timeout)
  }, [value, rendered, exitMs])

  return {
    rendered: value ?? rendered,
    isClosing: value === null && rendered !== null,
  }
}

export default usePresence
