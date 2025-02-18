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

}