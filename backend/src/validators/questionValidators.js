import { z } from 'zod';

const optionSchema = z.object({
  id: z.string().min(1, 'Option ID is required'),
  text: z.string().trim().min(1, 'Option text is required')
});

export const createQuestionSchema = z
  .object({
    quiz: z.string().optional(), // Can come from URL params or body
    questionText: z.string().trim().min(5, 'Question text must be at least 5 characters').max(1000),
    questionType: z.literal('single-choice').default('single-choice'),
    options: z
      .array(optionSchema)
      .min(2, 'Must provide at least 2 options')
      .refine(
        (opts) => {
          const ids = opts.map((o) => o.id);
          return new Set(ids).size === ids.length;
        },
        { message: 'Option IDs must be unique' }
      ),
    correctAnswerId: z.string().min(1, 'Correct answer identifier is required'),
    explanation: z.string().trim().min(5, 'Explanation must be at least 5 characters').max(1500),
    points: z.number().min(1).default(1),
    order: z.number().optional().default(0)
  })
  .refine(
    (data) => {
      return data.options.some((opt) => opt.id === data.correctAnswerId);
    },
    {
      message: 'correctAnswerId must correspond to one of the provided options',
      path: ['correctAnswerId']
    }
  );

export const updateQuestionSchema = z.object({
  questionText: z.string().trim().min(5).max(1000).optional(),
  options: z
    .array(optionSchema)
    .min(2)
    .refine(
      (opts) => {
        const ids = opts.map((o) => o.id);
        return new Set(ids).size === ids.length;
      },
      { message: 'Option IDs must be unique' }
    )
    .optional(),
  correctAnswerId: z.string().optional(),
  explanation: z.string().trim().min(5).max(1500).optional(),
  points: z.number().min(1).optional(),
  order: z.number().optional()
});
