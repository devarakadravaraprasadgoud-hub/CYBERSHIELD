import mongoose from 'mongoose';

const answerSnapshotSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    selectedOptionId: {
      type: String,
      default: null
    },
    correctOptionId: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    explanation: {
      type: String,
      default: ''
    },
    pointsAwarded: {
      type: Number,
      default: 0
    },
    maxPoints: {
      type: Number,
      default: 1
    },
    optionsSnapshot: [
      {
        id: String,
        text: String
      }
    ]
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
      index: true
    },
    answers: {
      type: [answerSnapshotSchema],
      default: []
    },
    score: {
      type: Number,
      default: 0
    },
    maxScore: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    correctAnswersCount: {
      type: Number,
      default: 0
    },
    totalQuestionsCount: {
      type: Number,
      default: 0
    },
    isPassed: {
      type: Boolean,
      default: false,
      index: true
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    submissionTime: {
      type: Date,
      default: null
    },
    durationSeconds: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

quizAttemptSchema.index({ user: 1, quiz: 1, createdAt: -1 });

export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
