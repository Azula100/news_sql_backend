const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String },
    course:      { type: String, required: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Хугацаа
    duration:  { type: Number, required: true }, // минутаар
    startTime: { type: Date },
    endTime:   { type: Date },

    // Тохиргоо
    totalPoints:      { type: Number, default: 100 },
    passingScore:     { type: Number, default: 60 },
    shuffleQuestions: { type: Boolean, default: false },
    maxAttempts:      { type: Number, default: 1 },

    // Аюулгүй байдал
    allowedGroups:   [{ type: String }],
    preventTabSwitch: { type: Boolean, default: true },
    preventCopyPaste: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ['draft', 'published', 'active', 'closed'],
      default: 'draft',
    },

    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);