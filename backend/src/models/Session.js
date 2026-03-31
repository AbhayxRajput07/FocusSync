const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: String,
  pomodoroLength: Number,
  breakLength: Number,
  startTime: Date,
  endTime: Date,
  finalScore: Number,
  distractionCount: Number,
  focusMinutes: Number,
  distractionMinutes: Number,
  readinessScore: Number,
  contract: {
    goal: String,
    partnerEmail: String,
    threshold: Number,
    passed: Boolean
  },
  events: [
    {
      timestamp: Date,
      type: { type: String },
      minuteIndex: Number,
      score: Number
    }
  ],
  minuteMap: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
