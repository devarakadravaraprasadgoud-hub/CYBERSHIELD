import mongoose from 'mongoose';

const completedModuleSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningModule',
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const viewedModuleSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningModule',
      required: true
    },
    lastViewedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const quizStatSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    bestScore: {
      type: Number,
      default: 0
    },
    bestPercentage: {
      type: Number,
      default: 0
    },
    isPassed: {
      type: Boolean,
      default: false
    },
    attemptsCount: {
      type: Number,
      default: 0
    },
    lastAttemptAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const earnedAchievementSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    badgeIcon: {
      type: String,
      default: 'Award'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    completedModules: [completedModuleSchema],
    viewedModules: [viewedModuleSchema],
    quizStats: [quizStatSchema],
    achievements: [earnedAchievementSchema]
  },
  {
    timestamps: true
  }
);

export const Progress = mongoose.model('Progress', progressSchema);
