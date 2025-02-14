import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { WordController } from '../controllers/wordController';
import { WordService } from '../services/wordService';
import { wordSchema, wordParamsSchema, wordQuerySchema, wordJsonSchema, wordParamsJsonSchema, wordQueryJsonSchema } from '../schemas/word';

export async function wordRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const wordService = new WordService(fastify.prisma);
  const wordController = new WordController(wordService);

  server.get(
    '/api/v1/words',
    {
      schema: {
        querystring: wordQueryJsonSchema,
        tags: ['words'],
        summary: 'Get all words'
      },
    },
    wordController.getWords,
  );

  server.get(
    '/api/v1/words/:id',
    {
      schema: {
        params: wordParamsJsonSchema,
        tags: ['words'],
        summary: 'Get a word by ID',
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              thai: { type: 'string' },
              english: { type: 'string' },
              romanized: { type: 'string' },
              ipa: { type: 'string' },
              example: { type: ['string', 'null'] },
              correctCount: { type: 'number' },
              wrongCount: { type: 'number' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    wordController.getWord,
  );

  server.post(
    '/api/v1/words',
    {
      schema: {
        body: wordJsonSchema,
        tags: ['words'],
        summary: 'Create a new word',
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              thai: { type: 'string' },
              english: { type: 'string' },
              romanized: { type: 'string' },
              ipa: { type: 'string' },
              example: { type: ['string', 'null'] },
              correctCount: { type: 'number' },
              wrongCount: { type: 'number' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    wordController.createWord,
  );

  server.patch(
    '/api/v1/words/:id',
    {
      schema: {
        params: wordParamsJsonSchema,
        body: {
          ...wordJsonSchema,
          required: []
        },
        tags: ['words'],
        summary: 'Update a word',
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              thai: { type: 'string' },
              english: { type: 'string' },
              romanized: { type: 'string' },
              ipa: { type: 'string' },
              example: { type: ['string', 'null'] },
              correctCount: { type: 'number' },
              wrongCount: { type: 'number' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    wordController.updateWord,
  );

  server.delete(
    '/api/v1/words/:id',
    {
      schema: {
        params: wordParamsJsonSchema,
        tags: ['words'],
        summary: 'Delete a word',
        response: {
          204: {
            type: 'null',
            description: 'Word successfully deleted',
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    wordController.deleteWord,
  );
}