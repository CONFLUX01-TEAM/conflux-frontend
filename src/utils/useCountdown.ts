import { useState, useEffect, useCallback } from 'react';

export const useCountdown = (initialSeconds: number) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const resetCountdown = useCallback(() => {
    setSecondsLeft(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  return { secondsLeft, resetCountdown, isActive };
};
