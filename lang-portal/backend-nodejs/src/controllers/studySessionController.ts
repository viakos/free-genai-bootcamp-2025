import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { StudySessionService } from '../services/studySessionService.js';
import {
  StudySessionSchema,
  StudySessionParamsSchema,
  StudySessionQuerySchema,
  StudyResultSchema,
} from '../schemas/studySession.js';

export class StudySessionController {
  constructor(private studySessionService: StudySessionService) {}

  async getStudySessionWords(
    request: FastifyRequest<{
      Params: { id: number };
    }>,
    reply: FastifyReply
  ) {
    try {
      const sessionId = request.params.id;
  
      // Fetch words associated with the study session
      const words = await this.studySessionService.getSessionWords(sessionId);
  
      if (!words) {
        return reply.status(404).send({ error: "Study session not found" });
      }
  
      // Mocked pagination (adjust based on actual logic)
      const pagination = {
        current_page: 1,
        total_pages: 1,
        total_items: words.length,
        items_per_page: 100,
      };
  
      return reply.send({ items: words, pagination });
    } catch (error) {
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  }
  

  getStudySessions = async (
    request: FastifyRequest<{
      Querystring: StudySessionQuerySchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    const { page, limit, activityId, groupId } = request.query;
  
    // Fetch sessions
    const result = await this.studySessionService.findAll(page, limit, activityId, groupId);
    
    // Log the mapped transformation before sending
    const mappedItems = result.sessions.map((session) => {
      return {
        id: session.id,
        activity_name: session.studyActivity?.name ?? "Unknown Activity",
        group_name: session.group?.name ?? "Unknown Group",
        start_time: session.startTime.toISOString(),
        end_time: session.endTime ? session.endTime.toISOString() : null
      };
    }); 
    
  
    return reply.send({
      items: mappedItems,
      pagination: result.pagination,
    });
  };
  

  getStudySession = async (
    request: FastifyRequest<{
      Params: StudySessionParamsSchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      const id = Number(request.params.id);
      const session = await this.studySessionService.findById(id);
      return reply.send(session);
    } catch (error) {
      if (error instanceof Error && error.message === 'Study session not found') {
        return reply.status(404).send({ error: 'Study session not found' });
      }
      throw error;
    }
  };

  async reviewWord(
    request: FastifyRequest<{
      Params: { id: number; word_id: number };
      Body: { correct: boolean };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id, word_id } = request.params;
      const { correct } = request.body;

      // Validate if the study session and word exist
      const review = await this.studySessionService.addReview(id, word_id, correct);

      return reply.status(201).send(review);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return reply.status(404).send({ error: "Study session or word not found" });
      }
      throw error;
    }
  }
}
