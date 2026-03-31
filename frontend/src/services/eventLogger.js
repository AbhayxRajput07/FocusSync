/**
 * Event Logger
 * Records session events for analytics and behavior tracking
 */

class EventLogger {
  constructor() {
    this.events = [];
  }

  /**
   * Log an event
   */
  log(type, data = {}) {
    const event = {
      type,
      timestamp: Date.now(),
      data: {
        ...data,
        sessionTime: data.sessionTime || Date.now(),
      },
    };

    this.events.push(event);
    return event;
  }

  /**
   * Log tab switch
   */
  logTabSwitch(tabSwitchCount, minuteIndex) {
    return this.log('tab_switch', {
      switchNumber: tabSwitchCount,
      minuteIndex,
    });
  }

  /**
   * Log warning issued
   */
  logWarning(level, minuteIndex) {
    return this.log('warning_issued', {
      level,
      minuteIndex,
    });
  }

  /**
   * Log user returned to focus
   */
  logReturnToFocus(recoveryTime, minuteIndex) {
    return this.log('return_to_focus', {
      recoveryTime, // seconds
      minuteIndex,
    });
  }

  /**
   * Log score update
   */
  logScoreUpdate(newScore, change, reason, minuteIndex) {
    return this.log('score_update', {
      newScore,
      change,
      reason,
      minuteIndex,
    });
  }

  /**
   * Log sound played
   */
  logSoundPlayed(soundType, minuteIndex) {
    return this.log('sound_played', {
      soundType,
      minuteIndex,
    });
  }

  /**
   * Log intervention triggered
   */
  logIntervention(level, reason, minuteIndex) {
    return this.log('intervention', {
      level,
      reason, // 'tab_switch', 'inactivity', 'escalation'
      minuteIndex,
    });
  }

  /**
   * Log achievement unlocked
   */
  logAchievementUnlocked(achievementId, minuteIndex) {
    return this.log('achievement_unlocked', {
      achievementId,
      minuteIndex,
    });
  }

  /**
   * Get all events
   */
  getAll() {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getByType(type) {
    return this.events.filter(e => e.type === type);
  }

  /**
   * Get events in time range (milliseconds)
   */
  getInRange(startTime, endTime) {
    return this.events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  /**
   * Count events by type
   */
  countByType(type) {
    return this.events.filter(e => e.type === type).length;
  }

  /**
   * Clear all events
   */
  clear() {
    this.events = [];
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    return {
      totalEvents: this.events.length,
      tabSwitches: this.countByType('tab_switch'),
      warningsIssued: this.countByType('warning_issued'),
      interventions: this.countByType('intervention'),
      achievementsUnlocked: this.countByType('achievement_unlocked'),
      soundsPlayed: this.countByType('sound_played'),
    };
  }
}

// Export singleton
export const eventLogger = new EventLogger();

export default {
  eventLogger,
  EventLogger,
};
