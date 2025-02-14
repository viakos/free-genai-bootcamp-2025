import { z } from 'zod';

// Zod schemas for type checking
export const studyActivitySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  thumbnailUrl: z.string().url().optional(),
});

export const studyActivityParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

export const studyActivityQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).default('20'),
});

// JSON Schema for Fastify validation
export const studyActivityJsonSchema = {
  type: 'object',
  required: ['name', 'description'],
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
    thumbnailUrl: { type: 'string', format: 'uri' }
  }
};

export const studyActivityParamsJsonSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', pattern: '^\\d+$' }
  }
};

export const studyActivityQueryJsonSchema = {
  type: 'object',
  properties: {
    page: { type: 'string', pattern: '^\\d+$' },  // Keep as string but validate it's a number
    limit: { type: 'string', pattern: '^\\d+$' }, // Keep as string but validate it's a number
  },
};


export type StudyActivitySchema = z.infer<typeof studyActivitySchema>;
export type StudyActivityParamsSchema = z.infer<typeof studyActivityParamsSchema>;
export type StudyActivityQuerySchema = z.infer<typeof studyActivityQuerySchema>;
