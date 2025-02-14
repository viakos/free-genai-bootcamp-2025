import { z } from 'zod';

// Zod schemas for type checking
export const wordSchema = z.object({
  thai: z.string().min(1),
  english: z.string().min(1),
  romanized: z.string().min(1),
  ipa: z.string().min(1),
  example: z.string().optional(),
});

export const wordParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

export const wordQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).default('20'),
  search: z.string().optional(),
});

// JSON Schema for Fastify validation
export const wordJsonSchema = {
  type: 'object',
  required: ['thai', 'english', 'romanized', 'ipa'],
  properties: {
    thai: { type: 'string', minLength: 1 },
    english: { type: 'string', minLength: 1 },
    romanized: { type: 'string', minLength: 1 },
    ipa: { type: 'string', minLength: 1 },
    example: { type: 'string' }
  }
};

export const wordParamsJsonSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', pattern: '^\\d+$' }
  }
};

export const wordQueryJsonSchema = {
  type: 'object',
  properties: {
    page: { type: 'string', pattern: '^\\d+$', default: '1' },
    limit: { type: 'string', pattern: '^\\d+$', default: '20' },
    search: { type: 'string' }
  }
};

export type WordSchema = z.infer<typeof wordSchema>;
export type WordParamsSchema = z.infer<typeof wordParamsSchema>;
export type WordQuerySchema = z.infer<typeof wordQuerySchema>;
