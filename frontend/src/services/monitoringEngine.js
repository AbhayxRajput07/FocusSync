import { DEFAULTS } from '../constants/defaults';

/**
 * Session Monitoring Engine
 * Tracks tab visibility, inactivity, and manages intervention levels
 * Singleton pattern - one instance per session
 */

class MonitoringEngine {
  constructor() {
    this.isActive = false;
    this.sessionStartTime = null;
    this.lastActivityTime = null;
    this.inactivityTimer = null;
    this.interventionLevel = 0;
    this.interventionCount = {
      level1: 0,
      level2: 0,
      level3: 0,
    };
    this.tabSwitchCount = 0;
    this.timeSinceLastActivity = 0;
    this.eventLog = [];
    this.callbacks = {
      onTabHidden: null,
      onTabReturned: null,
      onInactivityDetected: null,
      onInterventionLevelChange: null,
      onActivityDetected: null,
      onSessionEvent: null,
    };
    this.settings = { ...DEFAULTS.session };
  }

  /**
   * Initialize monitoring for a new session
   */
  start(settings = {}) {
    this.isActive = true;
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    this.settings = { ...DEFAULTS.session, ...settings };
    this.interventionLevel = 0;
    this.interventionCount = { level1: 0, level2: 0, level3: 0 };
    this.tabSwitchCount = 0;
    this.eventLog = [];

    this._attachEventListeners();
    this._startInactivityTimer();
    this._logEvent('session_started', { timestamp: this.sessionStartTime });
  }

  /**
   * Stop monitoring and cleanup
   */
  stop() {
    this.isActive = false;
    this._detachEventListeners();
    this._clearInactivityTimer();
    this._logEvent('session_stopped', { timestamp: Date.now() });
  }

  /**
   * Register callback for events
   */
  on(eventType, callback) {
    if (this.callbacks.hasOwnProperty(`on${eventType}`)) {
      this.callbacks[`on${eventType}`] = callback;
    }
  }

  /**
   * Attach document event listeners
   */
  _attachEventListeners() {
    // Tab visibility tracking
    document.addEventListener('visibilitychange', this._handleVisibilityChange);
    // Activity tracking
    document.addEventListener('mousemove', this._handleActivity);
    document.addEventListener('keydown', this._handleActivity);
    document.addEventListener('click', this._handleActivity);
    document.addEventListener('scroll', this._handleActivity);
    document.addEventListener('touchstart', this._handleActivity);
  }

  /**
   * Detach event listeners
   */
  _detachEventListeners() {
    document.removeEventListener('visibilitychange', this._handleVisibilityChange);
    document.removeEventListener('mousemove', this._handleActivity);
    document.removeEventListener('keydown', this._handleActivity);
    document.removeEventListener('click', this._handleActivity);
    document.removeEventListener('scroll', this._handleActivity);
    document.removeEventListener('touchstart', this._handleActivity);
  }

  /**
   * Handle visibility changes (tab switch)
   */
  _handleVisibilityChange = () => {
    if (!this.isActive) return;

    if (document.hidden) {
      this._onTabHidden();
    } else {
      this._onTabReturned();
    }
  };

  /**
   * Handle tab hidden event
   */
  _onTabHidden() {
    this.tabSwitchCount++;
    const timeAwayStart = Date.now();
    this._logEvent('tab_hidden', { timestamp: timeAwayStart, switchCount: this.tabSwitchCount });

    if (this.callbacks.onTabHidden) {
      this.callbacks.onTabHidden({
        timestamp: timeAwayStart,
        switchCount: this.tabSwitchCount,
      });
    }
  }

  /**
   * Handle tab returned event
   */
  _onTabReturned() {
    const returnTime = Date.now();
    this._logEvent('tab_returned', { timestamp: returnTime });

    // Reset inactivity on tab return
    this.lastActivityTime = returnTime;
    this._resetInactivityTimer();

    if (this.callbacks.onTabReturned) {
      this.callbacks.onTabReturned({ timestamp: returnTime });
    }
  }

  /**
   * Handle user activity
   */
  _handleActivity = () => {
    if (!this.isActive || document.hidden) return;

    const now = Date.now();
    const timeSinceLastActivity = (now - this.lastActivityTime) / 1000;

    // Only log significant activity gaps (> 2 seconds)
    if (timeSinceLastActivity > 2) {
      this._logEvent('activity_detected', {
        timestamp: now,
        idleTime: timeSinceLastActivity,
      });

      if (this.callbacks.onActivityDetected) {
        this.callbacks.onActivityDetected({
          timestamp: now,
          idleTime: timeSinceLastActivity,
        });
      }
    }

    this.lastActivityTime = now;
    this._resetInactivityTimer();

    // If returning from intervention level, check if we can de-escalate
    if (this.interventionLevel > 0) {
      this._checkDeescalation();
    }
  };

  /**
   * Start/reset inactivity timer
   */
  _startInactivityTimer() {
    this._clearInactivityTimer();
    const threshold = this.settings.inactivityThreshold || 60;

    this.inactivityTimer = setInterval(() => {
      if (!this.isActive) return;

      const now = Date.now();
      const inactiveTime = (now - this.lastActivityTime) / 1000;

      if (inactiveTime > threshold) {
        this._triggerInactivityIntervention(inactiveTime);
      }
    }, 1000); // Check every second
  }

  /**
   * Reset inactivity timer
   */
  _resetInactivityTimer() {
    this._clearInactivityTimer();
    this._startInactivityTimer();
  }

  /**
   * Clear inactivity timer
   */
  _clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearInterval(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  /**
   * Trigger inactivity intervention (escalates based on duration)
   */
  _triggerInactivityIntervention(inactiveSeconds) {
    let newLevel = 1;

    // Determine intervention level based on inactivity duration and count
    if (inactiveSeconds > 900) {
      // 15 minutes - Level 3
      newLevel = 3;
    } else if (inactiveSeconds > 300 || this.interventionCount.level2 > 0) {
      // 5 minutes or had level 2 before - Level 2
      newLevel = 2;
    } else {
      // Level 1
      newLevel = 1;
    }

    // Only escalate if not already at this level
    if (newLevel > this.interventionLevel) {
      this._escalateIntervention(newLevel, inactiveSeconds);
    }
  }

  /**
   * Handle tab switch intervention
   */
  triggerTabSwitchIntervention() {
    if (!this.isActive) return;

    // Tab switch can trigger Level 1 or 2 based on strictness
    let initialLevel = 1;
    if (this.settings.interventionStrictness === 'strict') {
      initialLevel = 2;
    }

    // If had Level 1, go to Level 2. If had Level 2, go to Level 3.
    if (this.interventionCount.level1 > 0 || this.interventionCount.level2 > 0) {
      initialLevel = 3;
    }

    if (initialLevel > this.interventionLevel) {
      this._escalateIntervention(initialLevel, 0);
    }
  }

  /**
   * Escalate intervention level
   */
  _escalateIntervention(newLevel, reason = 0) {
    const oldLevel = this.interventionLevel;
    this.interventionLevel = newLevel;
    this.interventionCount[`level${newLevel}`]++;

    this._logEvent(`intervention_level_${newLevel}`, {
      timestamp: Date.now(),
      fromLevel: oldLevel,
      reason,
    });

    if (this.callbacks.onInterventionLevelChange) {
      this.callbacks.onInterventionLevelChange({
        newLevel,
        oldLevel,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * De-escalate intervention when user returns
   */
  _checkDeescalation() {
    if (this.interventionLevel > 0) {
      // Return to Level 0 only if activity resumes for 5+ seconds
      const now = Date.now();
      if ((now - this.lastActivityTime) < 5000) {
        const oldLevel = this.interventionLevel;
        this.interventionLevel = 0;

        this._logEvent('intervention_resolved', {
          timestamp: now,
          fromLevel: oldLevel,
        });

        if (this.callbacks.onInterventionLevelChange) {
          this.callbacks.onInterventionLevelChange({
            newLevel: 0,
            oldLevel,
            timestamp: now,
          });
        }
      }
    }
  }

  /**
   * Log event for analytics
   */
  _logEvent(type, data) {
    const event = {
      type,
      timestamp: data.timestamp || Date.now(),
      data,
    };
    this.eventLog.push(event);

    if (this.callbacks.onSessionEvent) {
      this.callbacks.onSessionEvent(event);
    }
  }

  /**
   * Get current session stats
   */
  getStats() {
    const now = Date.now();
    const sessionDuration = (now - this.sessionStartTime) / 1000;
    const currentInactivity = (now - this.lastActivityTime) / 1000;

    return {
      sessionDuration,
      tabSwitches: this.tabSwitchCount,
      interventions: this.interventionCount,
      currentInterventionLevel: this.interventionLevel,
      currentInactivityTime: currentInactivity,
      eventCount: this.eventLog.length,
    };
  }

  /**
   * Get event log
   */
  getEventLog() {
    return [...this.eventLog];
  }

  /**
   * Clear event log
   */
  clearEventLog() {
    this.eventLog = [];
  }
}

// Export singleton instance
export const monitoringEngine = new MonitoringEngine();

export default {
  monitoringEngine,
  MonitoringEngine,
};
