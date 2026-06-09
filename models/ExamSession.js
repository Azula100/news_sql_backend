const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question:        { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOptions: [{ type: mongoose.Schema.Types.ObjectId }],
  textAnswer:      { type: String },
  isCorrect:       { type: Boolean },
  pointsEarned:    { type: Number, default: 0 },
});

const sessionSchema = new mongoose.Schema(
  {
    exam:    { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    status: {
      type: String,
      enum: ['started', 'submitted', 'graded', 'expired'],
      default: 'started',
    },

    startedAt:   { type: Date, default: Date.now },
    submittedAt: { type: Date },
    expiresAt:   { type: Date, required: true },

    answers: [answerSchema],

    // Аюулгүй байдал
    tabSwitchCount: { type: Number, default: 0 },
    ipAddress:      { type: String },

    // Дүн
    totalPoints:  { type: Number },
    earnedPoints: { type: Number },
    percentage:   { type: Number },
    isPassed:     { type: Boolean },
    attemptNumber: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExamSession', sessionSchema);