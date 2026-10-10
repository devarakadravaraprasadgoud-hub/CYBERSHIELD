import mongoose from 'mongoose';

const simulationDecisionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    selectedOptionId: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    explanation: { type: String, default: '' },
    answeredAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const simulationSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    simulation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttackSimulation',
      required: true,
      index: true
    },
    mode: {
      type: String,
      enum: ['attack', 'defense'],
      default: 'attack'
    },
    currentStageIndex: {
      type: Number,
      default: 0
    },
    completedStageIds: [{ type: String }],
    decisions: [simulationDecisionSchema],
    score: {
      type: Number,
      default: 0
    },
    isCompleted: {
      type: Boolean,
      default: false
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

simulationSessionSchema.index({ user: 1, simulation: 1 }, { unique: true });

export const SimulationSession = mongoose.model('SimulationSession', simulationSessionSchema);
