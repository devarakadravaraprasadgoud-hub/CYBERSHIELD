import { z } from 'zod';

const contentSectionSchema = z.object({
  title: z.string().trim().min(2, 'Section title is required'),
  content: z.string().trim().min(5, 'Section content is required'),
  calloutType: z.enum(['info', 'warning', 'tip', 'alert', 'none']).optional().default('none'),
  calloutText: z.string().optional().default(''),
  keyTakeaway: z.string().optional().default(''),
  order: z.number().optional().default(0)
});

export const createModuleSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  topic: z.string().min(1, 'Topic ID is required'),
  shortDescription: z.string().trim().min(10, 'Short description is required').max(500),
  learningObjectives: z.array(z.string().trim()).optional().default([]),
  contentSections: z.array(contentSectionSchema).min(1, 'At least one content section is required'),
  estimatedReadingTime: z.number().min(1).max(180).optional().default(5),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  order: z.number().optional().default(0),
  isPublished: z.boolean().optional().default(true)
});

export const updateModuleSchema = createModuleSchema.partial();
