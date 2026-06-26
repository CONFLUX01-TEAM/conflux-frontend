import { useState, useEffect, useCallback } from 'react'

export const useCountdown = (initialSeconds: number) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, secondsLeft])

  const resetCountdown = useCallback(() => {
    setSecondsLeft(initialSeconds)
    setIsRunning(true)
  }, [initialSeconds])

  const isActive = isRunning && secondsLeft > 0

  return { secondsLeft, resetCountdown, isActive }
}
