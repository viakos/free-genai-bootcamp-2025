import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { WordService } from '../services/wordService';
import { WordSchema, WordParamsSchema, WordQuerySchema } from '../schemas/word';

export class WordController {
  constructor(private wordService: WordService) {}

  getWords = async (
    request: FastifyRequest<{
      Querystring: WordQuerySchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    const { page, limit, search } = request.query;
    const result = await this.wordService.findAll(page, limit, search);
    return reply.send(result);
  };

  getWord = async (
    request: FastifyRequest<{
      Params: WordParamsSchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      const { id } = request.params;
      const word = await this.wordService.findById(id);
      return reply.send(word);
    } catch (error) {
      if (error instanceof Error && error.message === 'Word not found') {
        return reply.status(404).send({ error: 'Word not found' });
      }
      throw error;
    }
  };

  createWord = async (
    request: FastifyRequest<{
      Body: WordSchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    const word = await this.wordService.create(request.body);
    return reply.status(201).send(word);
  };

  updateWord = async (
    request: FastifyRequest<{
      Params: WordParamsSchema;
      Body: Partial<WordSchema>;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      const { id } = request.params;
      const word = await this.wordService.update(id, request.body);
      return reply.send(word);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        return reply.status(404).send({ error: 'Word not found' });
      }
      throw error;
    }
  };

  deleteWord = async (
    request: FastifyRequest<{
      Params: WordParamsSchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      const { id } = request.params;
      await this.wordService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return reply.status(404).send({ error: 'Word not found' });
      }
      throw error;
    }
  };
}
