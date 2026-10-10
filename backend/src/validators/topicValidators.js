import { z } from 'zod';

export const createTopicSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1000),
  category: z.string().trim().min(2, 'Category is required'),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  thumbnailUrl: z.string().optional().default(''),
  iconName: z.string().optional().default('ShieldCheck'),
  isPublished: z.boolean().optional().default(true)
});

export const updateTopicSchema = createTopicSchema.partial();
