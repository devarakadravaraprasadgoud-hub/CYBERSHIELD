import { z } from 'zod';

export const createSimulationSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(180),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1500),
  category: z.enum([
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
  ]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
  estimatedDuration: z.string().optional().default('8 min'),
  icon: z.string().optional().default('ShieldAlert'),
  learningObjectives: z.array(z.string()).optional().default([]),
  nodes: z.array(z.any()).optional().default([]),
  edges: z.array(z.any()).optional().default([]),
  attackStages: z.array(z.any()).optional().default([]),
  defenseStages: z.array(z.any()).optional().default([]),
  checkpoint: z.any().optional(),
  isPublished: z.boolean().optional().default(true),
  order: z.number().optional().default(0)
});

export const updateSimulationSchema = createSimulationSchema.partial();

export const updateSessionProgressSchema = z.object({
  mode: z.enum(['attack', 'defense']).optional(),
  currentStageIndex: z.number().min(0).optional(),
  completedStageId: z.string().optional(),
  decision: z
    .object({
      question: z.string(),
      selectedOptionId: z.string(),
      isCorrect: z.boolean(),
      explanation: z.string().optional()
    })
    .optional()
});

export const completeSessionSchema = z.object({
  score: z.number().min(0).max(100).optional().default(100)
});
