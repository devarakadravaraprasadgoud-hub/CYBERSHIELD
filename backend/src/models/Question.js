import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz reference is required'],
      index: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [1000, 'Question text cannot exceed 1000 characters']
    },
    questionType: {
      type: String,
      enum: ['single-choice'],
      default: 'single-choice'
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: function (val) {
          if (!Array.isArray(val) || val.length < 2) return false;
          const ids = val.map((o) => o.id);
          const uniqueIds = new Set(ids);
          return uniqueIds.size === ids.length;
        },
        message: 'Questions must have at least 2 distinct options with unique IDs'
      }
    },
    correctAnswerId: {
      type: String,
      required: [true, 'Correct answer identifier is required'],
      validate: {
        validator: function (val) {
          if (!this.options || this.options.length === 0) return true;
          return this.options.some((o) => o.id === val);
        },
        message: 'Correct answer ID must match one of the defined options'
      }
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required for learner feedback'],
      trim: true,
      maxlength: [1500, 'Explanation cannot exceed 1500 characters']
    },
    points: {
      type: Number,
      default: 1,
      min: 1
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const Question = mongoose.model('Question', questionSchema);
