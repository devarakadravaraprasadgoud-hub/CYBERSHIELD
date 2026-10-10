import { z } from 'zod';

export const createResourceSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(180),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1000),
  module: z.string().min(1, 'Module ID is required'),
  topic: z.string().optional(),
  type: z.enum(['video', 'audio', 'flowchart', 'diagram', 'infographic', 'simulation']),
  contentUrl: z.string().optional().default(''),
  thumbnailUrl: z.string().optional().default(''),
  duration: z.string().optional().default('5 min'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
  provider: z.string().optional().default('CyberShield Academy'),
  transcript: z.string().optional().default(''),
  keyTakeaways: z.array(z.string()).optional().default([]),
  flowchartData: z.record(z.any()).optional(),
  diagramData: z.record(z.any()).optional(),
  simulationType: z
    .enum(['none', 'firewall', 'sqli', 'password', 'phishing', 'hash', 'tcp_handshake'])
    .optional()
    .default('none'),
  simulationConfig: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional().default([]),
  order: z.number().optional().default(0),
  isPublished: z.boolean().optional().default(true)
});

export const updateResourceSchema = createResourceSchema.partial();

export const saveProgressSchema = z.object({
  lastPosition: z.number().min(0).optional().default(0),
  completionPercentage: z.number().min(0).max(100).optional().default(100),
  isCompleted: z.boolean().optional().default(true),
  notes: z.string().optional().default('')
});
