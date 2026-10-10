import mongoose from 'mongoose';

const simulationNodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'start',
        'attacker_action',
        'user_action',
        'system',
        'weakness',
        'attack_event',
        'warning',
        'decision',
        'outcome',
        'defense_control',
        'recovery'
      ],
      required: true
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    icon: { type: String, default: 'Shield' },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    mode: { type: String, enum: ['both', 'attack', 'defense'], default: 'both' }
  },
  { _id: false }
);

const simulationEdgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    label: { type: String, default: '' },
    animated: { type: Boolean, default: true },
    mode: { type: String, enum: ['both', 'attack', 'defense'], default: 'both' }
  },
  { _id: false }
);

const checkpointOptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    explanation: { type: String, required: true },
    consequence: { type: String, default: '' }
  },
  { _id: false }
);

const decisionCheckpointSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: [checkpointOptionSchema]
  },
  { _id: false }
);

const simulationStageSchema = new mongoose.Schema(
  {
    stageId: { type: String, required: true },
    stageNumber: { type: Number, required: true },
    title: { type: String, required: true },
    nodeId: { type: String, required: true },
    nodeType: { type: String, default: 'attack_event' },
    description: { type: String, required: true },
    whatIsHappening: { type: String, required: true },
    whyCanThisHappen: { type: String, required: true },
    whatShouldYouNotice: { type: String, required: true },
    whatCouldBeImpact: { type: String, required: true },
    howCanItBePrevented: { type: String, required: true },
    realWorldLesson: { type: String, required: true },
    technicalDetails: { type: String, default: '' },
    warningSigns: [{ type: String }],
    checkpoint: decisionCheckpointSchema
  },
  { _id: false }
);

const attackSimulationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Simulation title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Simulation description is required'],
      maxlength: [1500, 'Description cannot exceed 1500 characters']
    },
    category: {
      type: String,
      enum: [
        'phishing',
        'password',
        'sqli',
        'xss',
        'mitm',
        'ransomware',
        'dos',
        'reconnaissance',
        'auth',
        'malware'
      ],
      required: [true, 'Simulation category is required'],
      index: true
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    estimatedDuration: {
      type: String,
      default: '8 min'
    },
    icon: {
      type: String,
      default: 'ShieldAlert'
    },
    learningObjectives: [{ type: String }],
    nodes: [simulationNodeSchema],
    edges: [simulationEdgeSchema],
    attackStages: [simulationStageSchema],
    defenseStages: [simulationStageSchema],
    checkpoint: decisionCheckpointSchema,
    isPublished: {
      type: Boolean,
      default: true,
      index: true
    },
    order: {
      type: Number,
      default: 0
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

attackSimulationSchema.index({ category: 1, isPublished: 1 });
attackSimulationSchema.index({ title: 'text', description: 'text' });

export const AttackSimulation = mongoose.model('AttackSimulation', attackSimulationSchema);
