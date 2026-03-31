export const StorageKeys = {
  SESSIONS: 'fs_sessions',
  FINGERPRINT: 'fs_fingerprint',
  STREAK: 'fs_streak',
  RECOVERY_STREAK: 'fs_recovery_streak',
  FOCUS_DEBT: 'fs_focus_debt',
  ACHIEVEMENTS: 'fs_achievements',
  SETTINGS: 'fs_settings',
  SOUND_PREF: 'fs_sound_pref'
};

const DEFAULT_SETTINGS = {
  pomodoroLength: 25,
  breakLength: 5,
  inactivityThreshold: 30, // seconds
  interventionStrictness: 'Standard', // Gentle, Standard, Strict
  notificationsEnabled: true,
  soundsEnabled: true,
  interventionSound: 'chime'
};

const DEFAULT_FINGERPRINT = {
  avgResponseTime: 0,
  peakDistractionHour: null,
  complianceRate: 100
};

const DEFAULT_STREAK = {
  current: 0,
  longest: 0,
  lastSessionDate: null
};

// Generic get/set
export function getStorageItem(key, defaultValue) {
  const item = localStorage.getItem(key);
  if (item === null) return defaultValue;
  try {
    return JSON.parse(item);
  } catch (e) {
    return item; // If it's a raw string like 'brown_noise'
  }
}

export function setStorageItem(key, value) {
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
}

// Specialized accessors
export function getSessions() {
  return getStorageItem(StorageKeys.SESSIONS, []);
}

export function addSession(sessionRecord) {
  const sessions = getSessions();
  sessions.push(sessionRecord);
  setStorageItem(StorageKeys.SESSIONS, sessions);
}

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...getStorageItem(StorageKeys.SETTINGS, {}) };
}

export function saveSettings(settings) {
  setStorageItem(StorageKeys.SETTINGS, settings);
}

export function getFingerprint() {
  return getStorageItem(StorageKeys.FINGERPRINT, DEFAULT_FINGERPRINT);
}

export function updateFingerprint(newFingerprint) {
  setStorageItem(StorageKeys.FINGERPRINT, newFingerprint);
}

export function getStreak() {
  return getStorageItem(StorageKeys.STREAK, DEFAULT_STREAK);
}

export function updateStreak(streakObj) {
  setStorageItem(StorageKeys.STREAK, streakObj);
}

export function getFocusDebt() {
  return getStorageItem(StorageKeys.FOCUS_DEBT, 0); // numeric minutes
}

export function updateFocusDebt(minutes) {
  setStorageItem(StorageKeys.FOCUS_DEBT, minutes);
}

export function getAchievements() {
  return getStorageItem(StorageKeys.ACHIEVEMENTS, []); // Array of ID strings
}

export function unlockAchievement(achievementId) {
  const achs = getAchievements();
  if (!achs.includes(achievementId)) {
    achs.push(achievementId);
    setStorageItem(StorageKeys.ACHIEVEMENTS, achs);
    return true; // actually unlocked
  }
  return false;
}

export function clearAllData() {
  Object.values(StorageKeys).forEach(key => localStorage.removeItem(key));
}
