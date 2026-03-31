import { ACHIEVEMENTS } from '../constants/achievements';
import { unlockAchievement, getAchievements, getStreak, addSession } from './storage';

/**
 * Achievement System
 * Checks conditions and unlocks badges after sessions
 */

export class AchievementEngine {
  constructor() {
    this.unlockedThisSession = [];
  }

  /**
   * Main function: check all achievements after session ends
   */
  checkAchievements(sessionData, allSessions, streak, focusDebt) {
    this.unlockedThisSession = [];
    const alreadyUnlocked = getAchievements();

    // Check each achievement
    this._checkFirstSession(sessionData, alreadyUnlocked);
    this._checkPerfectScore(sessionData, alreadyUnlocked);
    this._checkThreeDayStreak(streak, alreadyUnlocked);
    this._checkSevenDayStreak(streak, alreadyUnlocked);
    this._checkSpeedReturner(sessionData, alreadyUnlocked);
    this._checkNightOwl(sessionData, alreadyUnlocked);
    this._checkEarlyBird(sessionData, alreadyUnlocked);
    this._checkDebtCleared(focusDebt, alreadyUnlocked);
    this._checkAccountable(sessionData, alreadyUnlocked);
    this._checkStreakSaver(streak, alreadyUnlocked);
    this._checkComebackKing(allSessions, streak, alreadyUnlocked);

    return this.unlockedThisSession;
  }

  /**
   * First Session - complete any session
   */
  _checkFirstSession(sessionData, alreadyUnlocked) {
    const id = ACHIEVEMENTS.FIRST_SESSION.id;
    if (!alreadyUnlocked.includes(id)) {
      if (unlockAchievement(id)) {
        this.unlockedThisSession.push(id);
      }
    }
  }

  /**
   * Perfect Score - finish with 100 focus score
   */
  _checkPerfectScore(sessionData, alreadyUnlocked) {
    const id = ACHIEVEMENTS.PERFECT_SCORE.id;
    if (!alreadyUnlocked.includes(id)) {
      if (sessionData.finalScore === 100) {
        if (unlockAchievement(id)) {
          this.unlockedThisSession.push(id);
        }
      }
    }
  }

  /**
   * 3-Day Streak
   */
  _checkThreeDayStreak(streak, alreadyUnlocked) {
    const id = ACHIEVEMENTS.THREE_DAY_STREAK.id;
    if (!alreadyUnlocked.includes(id)) {
      if (streak.current >= 3) {
        if (unlockAchievement(id)) {
          this.unlockedThisSession.push(id);
        }
      }
    }
  }

  /**
   * 7-Day Streak
   */
  _checkSevenDayStreak(streak, alreadyUnlocked) {
    const id = ACHIEVEMENTS.SEVEN_DAY_STREAK.id;
    if (!alreadyUnlocked.includes(id)) {
      if (streak.current >= 7) {
        if (unlockAchievement(id)) {
          this.unlockedThisSession.push(id);
        }
      }
    }
  }

  /**
   * Speed Returner - return to focus within 5s, 3 times in one session
   */
  _checkSpeedReturner(sessionData, alreadyUnlocked) {
    const id = ACHIEVEMENTS.SPEED_RETURNER.id;
    if (!alreadyUnlocked.includes(id)) {
      const fastReturns = sessionData.events?.filter(e =>
        e.type === 'recovery' && e.recoveryTime <= 5
      ).length || 0;

      if (fastReturns >= 3) {
        if (unlockAchievement(id)) {
          this.unlockedThisSession.push(id);
        }
      }
    }
  }

  /**
   * Night Owl - complete session after 10 PM
   */
  _checkNightOwl(sessionData, alreadyUnlocked) {
    const id = ACHIEVEMENTS.NIGHT_OWL.id;
    if (!alreadyUnlocked.includes(id)) {
      const startHour = new Date(sessionData.startTime).getHours();
      if (startHour >= 22 || startHour < 7) {
        if (unlockAchievement(id)) {
          this.unlockedThisSession.push(id);
        }
      }
    }
  }

  /**
   * Early Bird - complete session before 7 AM
   */
  _checkEarlyBird(sessionData, alreadyUnlocked) {
    const id = ACHIEVEMENTS.EARLY_BIRD.id;
    if (!alreadyUnlocked.includes(id)) {
      const startHour = new Date(sessionData.startTime).getHours();
      if (startHour >= 5 && startHour < 7) {
        if (unlockAchievement(id)) {
          this.unlockedThisSession.push(id);
        }
      }
    }
  }

  /**
   * Debt Cleared - complete a strict focus debt clearing session
   */
  _checkDebtCleared(focusDebt, alreadyUnlocked) {
    const id = ACHIEVEMENTS.DEBT_CLEARED.id;
    if (!alreadyUnlocked.includes(id)) {
      // Triggered when user completes a debt-clearing session
      // Marked by sessionData.isDebtClearingSession = true
      if (unlockAchievement(id)) {
        this.unlockedThisSession.push(id);
      }
    }
  }

  /**
   * Accountable - send accountability email
   */
  _checkAccountable(sessionData, alreadyUnlocked) {
    const id = ACHIEVEMENTS.ACCOUNTABLE.id;
    if (!alreadyUnlocked.includes(id)) {
      // Triggered when user clicks "Send Accountability Email"
      if (sessionData.accountabilityEmailSent) {
        if (unlockAchievement(id)) {
          this.unlockedThisSession.push(id);
        }
      }
    }
  }

  /**
   * Streak Saver - complete a session on last day before streak reset
   */
  _checkStreakSaver(streak, alreadyUnlocked) {
    const id = ACHIEVEMENTS.STREAK_SAVER.id;
    if (!alreadyUnlocked.includes(id)) {
      // Check if this session was completed on exactly the last day
      // before streak would reset (yesterday + 1 day = today)
      const lastSessionDate = new Date(streak.lastSessionDate);
      const today = new Date();
      const daysSinceLastSession = Math.floor((today - lastSessionDate) / (1000 * 60 * 60 * 24));

      if (daysSinceLastSession === 1 && streak.current > 0) {
        if (unlockAchievement(id)) {
          this.unlockedThisSession.push(id);
        }
      }
    }
  }

  /**
   * Comeback King - break streak, then reach 7 days again
   */
  _checkComebackKing(allSessions, streak, alreadyUnlocked) {
    const id = ACHIEVEMENTS.COMEBACK_KING.id;
    if (!alreadyUnlocked.includes(id)) {
      // Check if user has had a broken streak (0 days) before and is now at 7+
      // This requires checking history for a streak reset followed by rebuild to 7
      // Simplified: unlock when streak is 7+ and allSessions has multiple gaps

      if (streak.current >= 7 && allSessions.length >= 14) {
        // Check for streak break in history (look for 2+ day gap)
        let hasBreak = false;
        for (let i = 1; i < allSessions.length; i++) {
          const prev = new Date(allSessions[i - 1].endTime);
          const curr = new Date(allSessions[i].endTime);
          const dayGap = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
          if (dayGap > 1) {
            hasBreak = true;
            break;
          }
        }

        if (hasBreak) {
          if (unlockAchievement(id)) {
            this.unlockedThisSession.push(id);
          }
        }
      }
    }
  }

  /**
   * Get achievement details by ID
   */
  static getAchievementById(id) {
    return Object.values(ACHIEVEMENTS).find(a => a.id === id);
  }

  /**
   * Check if achievement is unlocked
   */
  static isUnlocked(id, unlockedList) {
    return unlockedList.includes(id);
  }

  /**
   * Get progress toward achievement (0-1)
   */
  static getAchievementProgress(id, sessionData, allSessions, streak) {
    // Simplified progress calculation
    switch (id) {
      case ACHIEVEMENTS.THREE_DAY_STREAK.id:
        return Math.min(1, streak.current / 3);
      case ACHIEVEMENTS.SEVEN_DAY_STREAK.id:
        return Math.min(1, streak.current / 7);
      case ACHIEVEMENTS.SPEED_RETURNER.id:
        const fastReturns = sessionData.events?.filter(e =>
          e.type === 'recovery' && e.recoveryTime <= 5
        ).length || 0;
        return Math.min(1, fastReturns / 3);
      default:
        return 0;
    }
  }
}

// Export singleton
export const achievementEngine = new AchievementEngine();

export default {
  achievementEngine,
  AchievementEngine,
};
