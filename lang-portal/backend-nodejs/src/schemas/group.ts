import { z } from 'zod';

// Zod schemas for type checking
export const groupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const groupParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

export const groupQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).default('20'),
});

export const addWordsToGroupSchema = z.object({
  wordIds: z.array(z.number()),
});

// JSON Schema for Fastify validation
export const groupJsonSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string' }
  }
};

export const groupParamsJsonSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', pattern: '^\\d+$' }
  }
};

export const groupQueryJsonSchema = {
  type: 'object',
  properties: {
    page: { type: 'string', pattern: '^\\d+$', default: '1' },
    limit: { type: 'string', pattern: '^\\d+$', default: '20' }
  }
};

export const addWordsToGroupJsonSchema = {
  type: 'object',
  required: ['wordIds'],
  properties: {
    wordIds: {
      type: 'array',
      items: { type: 'number' }
    }
  }
};

export type GroupSchema = z.infer<typeof groupSchema>;
export type GroupParamsSchema = z.infer<typeof groupParamsSchema>;
export type GroupQuerySchema = z.infer<typeof groupQuerySchema>;
export type AddWordsToGroupSchema = z.infer<typeof addWordsToGroupSchema>;
