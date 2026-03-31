const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  settings: {
    defaultPomodoro: { type: Number, default: 25 },
    defaultBreak: { type: Number, default: 5 },
    inactivityThreshold: { type: Number, default: 30 },
    interventionStrictness: { type: String, default: 'standard' },
    soundPreference: { type: String, default: 'brown' },
    notificationsEnabled: { type: Boolean, default: true }
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastSessionDate: Date
  },
  recoveryStreak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 }
  },
  focusDebt: { type: Number, default: 0 },
  fingerprint: {
    avgResponseTime: Number,
    peakDistractionHour: Number,
    complianceRate: Number
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
