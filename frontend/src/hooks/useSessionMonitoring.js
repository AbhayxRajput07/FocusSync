import { useState, useEffect, useCallback, useRef } from 'react';
import { getSettings, getFingerprint } from '../services/storage';

export function useSessionMonitoring(onIntervention, onScoreChange, onLogEvent) {
  const [score, setScore] = useState(100);
  const [lastDistractionTime, setLastDistractionTime] = useState(null);
  const [distractionCount, setDistractionCount] = useState(0);

  const settings = useRef(getSettings());
  const fingerprint = useRef(getFingerprint());
  const inactivityTimer = useRef(null);
  const consecutiveInfractionsTimer = useRef(null);
  const infractionCountWindow = useRef(0);
  const awayStartTime = useRef(null);

  const triggerIntervention = useCallback((type, source) => {
    // Determine level
    let level = 1;
    infractionCountWindow.current += 1;
    
    // Clear the 5 minute window timer and reset it
    clearTimeout(consecutiveInfractionsTimer.current);
    consecutiveInfractionsTimer.current = setTimeout(() => {
      infractionCountWindow.current = 0;
    }, 5 * 60 * 1000); // 5 minutes

    const isAwayTooLong = awayStartTime.current && (Date.now() - awayStartTime.current > 2 * 60 * 1000);

    if (isAwayTooLong || infractionCountWindow.current >= 3) {
      level = 3;
    } else if (infractionCountWindow.current === 2) {
      level = 2;
    }

    if (level === 1 && fingerprint.current.complianceRate < 40) {
      // Skip level 1 if compliance is poor
      level = 2;
    }

    // Apply score penalties
    let penalty = 0;
    if (level === 1) penalty = 5;
    if (level === 2) penalty = 10;
    if (level === 3) penalty = 15;

    let newScore = Math.max(0, score - penalty);
    setScore(newScore);
    onScoreChange(newScore);
    
    setLastDistractionTime(Date.now());
    setDistractionCount(prev => prev + 1);

    onLogEvent({
      type: 'warning',
      source,
      level,
      score: newScore,
      timestamp: Date.now()
    });

    onIntervention(level);

  }, [score, onIntervention, onScoreChange, onLogEvent]);

  const handleReturnToFocus = useCallback(() => {
    if (awayStartTime.current) {
      awayStartTime.current = null;
    }
    
    if (lastDistractionTime) {
      const timeAway = Date.now() - lastDistractionTime;
      if (timeAway <= 30 * 1000) {
        // Recovery bonus
        const newScore = Math.min(100, score + 2);
        setScore(newScore);
        onScoreChange(newScore);
        onLogEvent({
          type: 'return',
          score: newScore,
          timestamp: Date.now(),
          recoveredFast: true
        });
      } else {
        onLogEvent({
          type: 'return',
          score,
          timestamp: Date.now(),
          recoveredFast: false
        });
      }
      setLastDistractionTime(null);
    }
  }, [lastDistractionTime, score, onScoreChange, onLogEvent]);

  const resetActivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    handleReturnToFocus();

    inactivityTimer.current = setTimeout(() => {
      if (!awayStartTime.current) {
        awayStartTime.current = Date.now();
        triggerIntervention(1, 'inactivity');
      }
    }, settings.current.inactivityThreshold * 1000);

  }, [handleReturnToFocus, triggerIntervention]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!awayStartTime.current) awayStartTime.current = Date.now();
        triggerIntervention(1, 'tab_switch');
        onLogEvent({ type: 'tab_switch', score, timestamp: Date.now() });
      } else {
        handleReturnToFocus();
      }
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetActivityTimer));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resetActivityTimer(); // start initially

    return () => {
      events.forEach(e => document.removeEventListener(e, resetActivityTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(inactivityTimer.current);
      clearTimeout(consecutiveInfractionsTimer.current);
    };
  }, [resetActivityTimer, handleReturnToFocus, triggerIntervention, score, onLogEvent]);

  return {
    score,
    distractionCount,
    setScore // in case we need to apply manual bonuses
  };
}
