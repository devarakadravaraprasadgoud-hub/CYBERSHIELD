import mongoose from 'mongoose';

const flowchartStepSchema = new mongoose.Schema(
  {
    stepId: { type: String, required: true },
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    technicalDetails: { type: String, default: '' },
    commandExample: { type: String, default: '' },
    securityImpact: { type: String, default: '' },
    category: {
      type: String,
      enum: ['reconnaissance', 'analysis', 'defense', 'containment', 'decision', 'action', 'process', 'validation'],
      default: 'process'
    },
    icon: { type: String, default: 'Shield' }
  },
  { _id: false }
);

const flowchartDataSchema = new mongoose.Schema(
  {
    workflowTitle: { type: String, required: true },
    overview: { type: String, default: '' },
    steps: [flowchartStepSchema],
    connections: [
      {
        from: { type: String, required: true },
        to: { type: String, required: true },
        label: { type: String, default: '' }
      }
    ]
  },
  { _id: false }
);

const diagramElementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    details: { type: String, required: true },
    protocolsOrTools: [String],
    securityConsideration: { type: String, default: '' },
    badge: { type: String, default: '' },
    highlight: { type: Boolean, default: false }
  },
  { _id: false }
);

const diagramDataSchema = new mongoose.Schema(
  {
    diagramType: {
      type: String,
      enum: ['layers', 'mindmap', 'comparison', 'matrix', 'architecture'],
      default: 'layers'
    },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    elements: [diagramElementSchema]
  },
  { _id: false }
);

const learningResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters']
    },
    description: {
      type: String,
      required: [true, 'Resource description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningModule',
      required: [true, 'Learning Module reference is required'],
      index: true
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic reference is required'],
      index: true
    },
    type: {
      type: String,
      enum: ['video', 'audio', 'flowchart', 'diagram', 'infographic', 'simulation'],
      required: [true, 'Resource type is required'],
      index: true
    },
    contentUrl: {
      type: String,
      default: ''
    },
    thumbnailUrl: {
      type: String,
      default: ''
    },
    duration: {
      type: String,
      default: '5 min'
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    provider: {
      type: String,
      default: 'CyberShield Academy'
    },
    transcript: {
      type: String,
      default: ''
    },
    keyTakeaways: [String],
    flowchartData: flowchartDataSchema,
    diagramData: diagramDataSchema,
    simulationType: {
      type: String,
      enum: ['none', 'firewall', 'sqli', 'password', 'phishing', 'hash', 'tcp_handshake'],
      default: 'none'
    },
    simulationConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    tags: [String],
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

learningResourceSchema.index({ module: 1, type: 1, isPublished: 1 });
learningResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const LearningResource = mongoose.model('LearningResource', learningResourceSchema);
