import { FastifyRequest, FastifyReply } from 'fastify';
import { WordService } from '../services/wordService';
import { WordParamsSchema, WordQuerySchema } from '../schemas/word';

export class WordController {
  constructor(private wordService: WordService) {}

  getWords = async (
    request: FastifyRequest<{ Querystring: WordQuerySchema }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { page, limit, search } = request.query;
    const result = await this.wordService.findAll(page, limit, search);
    reply.send(result);
  };

  getWord = async (
    request: FastifyRequest<{ Params: WordParamsSchema }>,
    reply: FastifyReply
  ): Promise<void> => {
    try {
      const { id } = request.params;
      const word = await this.wordService.findById(id);
      reply.send(word);
    } catch (error) {
      if (error instanceof Error && error.message === 'Word not found') {
        reply.status(404).send({ error: 'Word not found' });
      } else {
        throw error;
      }
    }
  };
}
