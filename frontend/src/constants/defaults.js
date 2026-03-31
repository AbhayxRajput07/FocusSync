export const DEFAULTS = {
  session: {
    pomodoroLength: 25, // minutes
    breakLength: 5, // minutes
    inactivityThreshold: 60, // seconds
    interventionStrictness: 'standard', // 'gentle' | 'standard' | 'strict'
  },
  score: {
    initial: 100,
    maxScore: 100,
    minScore: 0,
    penalties: {
      tabSwitch: 5,
      inactivityPerMin: 2,
      level1Intervention: 5,
      level2Intervention: 10,
      level3Intervention: 15,
    },
    bonuses: {
      completionWithZeroDistractions: 10,
      streakMaintenance: 5,
      focusDebtRecovery: 3,
      returnWithin30s: 2,
    },
  },
  interventions: {
    level1: {
      triggerAfter: 30, // seconds of inactivity
      duration: 5, // seconds to dismiss
      autoClose: true,
    },
    level2: {
      triggerAfter: 300, // seconds (5 min) or second infraction
      duration: 10, // seconds with countdown
      autoClose: false,
      requiresInteraction: true,
    },
    level3: {
      triggerAfter: 900, // seconds (15 min) or third infraction
      duration: 60, // seconds mandatory wait
      autoClose: false,
      blocksInteraction: true,
    },
  },
  focusDebt: {
    threshold: 30, // minutes
    debtClearSessionLength: 10, // minutes
  },
  audio: {
    defaultMode: 'brown-noise', // 'brown-noise' | 'binaural' | 'lofi' | 'auto' | 'silence'
    autoModeSchedule: {
      first10: 'brown-noise',
      middle: 'binaural',
      last5: 'lofi',
    },
    volume: 0.5, // 0-1
  },
  notifications: {
    soundAlerts: true,
    browserNotifications: false,
  },
  theme: {
    darkMode: true,
  },
};

export const STREAK_LEVELS = {
  BROKEN: 0,
  STARTER: 3,
  DEVELOPING: 7,
  BECOMING_HABIT: 14,
  STRONG_HABIT: 30,
  LEGENDARY: 100,
};
