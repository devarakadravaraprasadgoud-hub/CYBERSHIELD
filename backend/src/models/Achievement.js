import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    badgeIcon: {
      type: String,
      default: 'Award'
    },
    category: {
      type: String,
      enum: ['learning', 'quiz', 'mastery'],
      default: 'learning'
    },
    criteriaType: {
      type: String,
      required: true
    },
    criteriaThreshold: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

export const Achievement = mongoose.model('Achievement', achievementSchema);
