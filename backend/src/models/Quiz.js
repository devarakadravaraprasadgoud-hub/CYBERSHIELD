import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic reference is required'],
      index: true
    },
    learningModule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningModule',
      default: null,
      index: true
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
      index: true
    },
    timeLimitMinutes: {
      type: Number,
      default: 10,
      min: [1, 'Time limit must be at least 1 minute']
    },
    passPercentage: {
      type: Number,
      default: 70,
      min: 1,
      max: 100
    },
    isRandomized: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

quizSchema.index({ title: 'text', description: 'text' });

export const Quiz = mongoose.model('Quiz', quizSchema);
