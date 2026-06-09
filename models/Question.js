const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text:      { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const questionSchema = new mongoose.Schema(
  {
    exam:      { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    type: {
      type: String,
      enum: ['single', 'multiple', 'truefalse', 'short'],
      required: true,
    },

    text:    { type: String, required: true },
    points:  { type: Number, default: 1 },
    order:   { type: Number, default: 0 },
    options: [optionSchema],

    // Богино хариулт автомат шалгах
    correctAnswer: { type: String },
    explanation:   { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);