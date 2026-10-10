import { z } from 'zod';

export const createQuizSchema = z.object({
  title: z.string().trim().min(3, 'Quiz title must be at least 3 characters').max(150),
  description: z.string().trim().min(10, 'Quiz description must be at least 10 characters').max(1000),
  topic: z.string().min(1, 'Topic ID is required'),
  learningModule: z.string().nullable().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  timeLimitMinutes: z.number().min(1).max(180).optional().default(10),
  passPercentage: z.number().min(1).max(100).optional().default(70),
  isRandomized: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(true)
});

export const updateQuizSchema = createQuizSchema.partial();
