import { z } from 'zod';

// Zod schemas for type checking
export const studySessionSchema = z.object({
  groupId: z.number(),
  activityId: z.number(),
});

export const studySessionParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

export const studySessionQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).default('20'),
  activityId: z.string().transform((val) => parseInt(val, 10)).optional(),
  groupId: z.string().transform((val) => parseInt(val, 10)).optional(),
});

export const studyResultSchema = z.object({
  wordId: z.number(),
  isCorrect: z.boolean(),
  responseTime: z.number().int().positive(),
});

// JSON Schema for Fastify validation
export const studySessionJsonSchema = {
  type: 'object',
  required: ['groupId', 'activityId'],
  properties: {
    groupId: { type: 'number' },
    activityId: { type: 'number' }
  }
};

export const studySessionParamsJsonSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', pattern: '^\\d+$' }
  }
};

export const studySessionQueryJsonSchema = {
  type: 'object',
  properties: {
    page: { type: 'string', pattern: '^\\d+$', default: '1' },
    limit: { type: 'string', pattern: '^\\d+$', default: '20' },
    activityId: { type: 'string', pattern: '^\\d+$' },
    groupId: { type: 'string', pattern: '^\\d+$' }
  }
};

export const studyResultJsonSchema = {
  type: 'object',
  required: ['wordId', 'isCorrect', 'responseTime'],
  properties: {
    wordId: { type: 'number' },
    isCorrect: { type: 'boolean' },
    responseTime: { type: 'number', minimum: 1 }
  }
};

export type StudySessionSchema = z.infer<typeof studySessionSchema>;
export type StudySessionParamsSchema = z.infer<typeof studySessionParamsSchema>;
export type StudySessionQuerySchema = z.infer<typeof studySessionQuerySchema>;
export type StudyResultSchema = z.infer<typeof studyResultSchema>;
