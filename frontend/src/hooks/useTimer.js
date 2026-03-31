import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useTimer Hook
 * Manages countdown timer with pause/resume functionality
 */
export const useTimer = (initialSeconds = 1500) => {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  /**
   * Start the timer
   */
  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
  }, []);

  /**
   * Pause the timer
   */
  const pause = useCallback(() => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  /**
   * Resume from pause
   */
  const resume = useCallback(() => {
    setIsPaused(false);
    startTimeRef.current = Date.now();
  }, []);

  /**
   * Reset timer to initial value
   */
  const reset = useCallback((newTime = initialSeconds) => {
    setTimeRemaining(newTime);
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [initialSeconds]);

  /**
   * Set time manually
   */
  const setTime = useCallback((seconds) => {
    setTimeRemaining(Math.max(0, seconds));
  }, []);

  /**
   * Main timer effect
   */
  useEffect(() => {
    if (!isRunning || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsRunning(false);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  /**
   * Format time as MM:SS
   */
  const getFormattedTime = useCallback(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  /**
   * Get progress as percentage (0-1)
   */
  const getProgress = useCallback((initial) => {
    return Math.max(0, Math.min(1, (initial - timeRemaining) / initial));
  }, [timeRemaining]);

  /**
   * Check if timer finished
   */
  const isFinished = timeRemaining <= 0;

  return {
    timeRemaining,
    isRunning,
    isPaused,
    isFinished,
    start,
    pause,
    resume,
    reset,
    setTime,
    getFormattedTime,
    getProgress,
  };
};

export default useTimer;
