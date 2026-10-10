import mongoose from 'mongoose';

const resourceProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningResource',
      required: true,
      index: true
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningModule',
      required: true,
      index: true
    },
    lastPosition: {
      type: Number,
      default: 0
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring one progress record per user per resource
resourceProgressSchema.index({ user: 1, resource: 1 }, { unique: true });
resourceProgressSchema.index({ user: 1, module: 1, isCompleted: 1 });

export const ResourceProgress = mongoose.model('ResourceProgress', resourceProgressSchema);
