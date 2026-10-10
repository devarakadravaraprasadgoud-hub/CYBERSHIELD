import mongoose from 'mongoose';

const contentSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    calloutType: {
      type: String,
      enum: ['info', 'warning', 'tip', 'alert', 'none'],
      default: 'none'
    },
    calloutText: {
      type: String,
      default: ''
    },
    keyTakeaway: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { _id: true }
);

const learningModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic reference is required'],
      index: true
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    learningObjectives: {
      type: [String],
      default: []
    },
    contentSections: {
      type: [contentSectionSchema],
      default: []
    },
    estimatedReadingTime: {
      type: Number,
      default: 5,
      min: 1
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
      index: true
    },
    order: {
      type: Number,
      default: 0
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

learningModuleSchema.index({ title: 'text', shortDescription: 'text' });

export const LearningModule = mongoose.model('LearningModule', learningModuleSchema);
