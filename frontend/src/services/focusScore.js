import { DEFAULTS } from '../constants/defaults';

/**
 * Focus Score Calculator
 * Manages the 0-100 score system with penalties and bonuses
 */

class FocusScoreCalculator {
  constructor() {
    this.score = 100;
    this.penalties = [];
    this.bonuses = [];
  }

  /**
   * Initialize score for a new session
   */
  reset() {
    this.score = DEFAULTS.score.initial;
    this.penalties = [];
    this.bonuses = [];
  }

  /**
   * Apply penalty for tab switch
   */
  applyTabSwitchPenalty() {
    const penalty = DEFAULTS.score.penalties.tabSwitch;
    this.penalties.push({ type: 'tab_switch', amount: penalty });
    this.score = Math.max(DEFAULTS.score.minScore, this.score - penalty);
    return { newScore: this.score, penalty };
  }

  /**
   * Apply penalty for inactivity (called per minute of inactivity)
   */
  applyInactivityPenalty(minutes = 1) {
    const penalty = DEFAULTS.score.penalties.inactivityPerMin * minutes;
    this.penalties.push({ type: 'inactivity', amount: penalty, minutes });
    this.score = Math.max(DEFAULTS.score.minScore, this.score - penalty);
    return { newScore: this.score, penalty };
  }

  /**
   * Apply penalty for intervention level triggered
   */
  applyInterventionPenalty(level = 1) {
    const penaltyMap = {
      1: DEFAULTS.score.penalties.level1Intervention,
      2: DEFAULTS.score.penalties.level2Intervention,
      3: DEFAULTS.score.penalties.level3Intervention,
    };
    const penalty = penaltyMap[level] || 0;
    if (penalty > 0) {
      this.penalties.push({ type: `intervention_level_${level}`, amount: penalty });
      this.score = Math.max(DEFAULTS.score.minScore, this.score - penalty);
    }
    return { newScore: this.score, penalty };
  }

  /**
   * Apply bonus for quick recovery (returning within 30s)
   */
  applyRecoveryBonus() {
    const bonus = DEFAULTS.score.bonuses.returnWithin30s;
    this.bonuses.push({ type: 'recovery', amount: bonus });
    this.score = Math.min(DEFAULTS.score.maxScore, this.score + bonus);
    return { newScore: this.score, bonus };
  }

  /**
   * Apply bonus for completing session with zero distractions
   */
  applyCompletionBonus(hasZeroDistractions = false) {
    if (hasZeroDistractions) {
      const bonus = DEFAULTS.score.bonuses.completionWithZeroDistractions;
      this.bonuses.push({ type: 'perfect_completion', amount: bonus });
      this.score = Math.min(DEFAULTS.score.maxScore, this.score + bonus);
      return { newScore: this.score, bonus };
    }
    return { newScore: this.score, bonus: 0 };
  }

  /**
   * Apply bonus for maintaining streak
   */
  applyStreakBonus() {
    const bonus = DEFAULTS.score.bonuses.streakMaintenance;
    this.bonuses.push({ type: 'streak_maintenance', amount: bonus });
    this.score = Math.min(DEFAULTS.score.maxScore, this.score + bonus);
    return { newScore: this.score, bonus };
  }

  /**
   * Apply bonus for clearing focus debt
   */
  applyFocusDebtBonus() {
    const bonus = DEFAULTS.score.bonuses.focusDebtRecovery;
    this.bonuses.push({ type: 'debt_recovery', amount: bonus });
    this.score = Math.min(DEFAULTS.score.maxScore, this.score + bonus);
    return { newScore: this.score, bonus };
  }

  /**
   * Get current score clamped to valid range
   */
  getScore() {
    return Math.max(
      DEFAULTS.score.minScore,
      Math.min(DEFAULTS.score.maxScore, this.score)
    );
  }

  /**
   * Get score summary for analytics
   */
  getSummary() {
    const totalPenalties = this.penalties.reduce((sum, p) => sum + p.amount, 0);
    const totalBonuses = this.bonuses.reduce((sum, b) => sum + b.amount, 0);
    return {
      finalScore: this.getScore(),
      totalPenalties,
      totalBonuses,
      penalties: this.penalties,
      bonuses: this.bonuses,
      distractionCount: this.penalties.filter(p => p.type !== 'intervention_level_1' && p.type !== 'intervention_level_2' && p.type !== 'intervention_level_3').length,
      interventionCount: this.penalties.filter(p => p.type.includes('intervention')).length,
    };
  }

  /**
   * Get score color for UI (green, amber, red)
   */
  getScoreColor() {
    const score = this.getScore();
    if (score >= 80) return 'green';
    if (score >= 60) return 'amber';
    return 'red';
  }

  /**
   * Determine if score qualifies as "passing" for a session
   */
  isPassing(threshold = 70) {
    return this.getScore() >= threshold;
  }
}

// Export singleton instance
export const scoreCalculator = new FocusScoreCalculator();

export default {
  scoreCalculator,
  FocusScoreCalculator,
};