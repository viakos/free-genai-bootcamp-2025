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

  getStudySessionWords = async (
    request: FastifyRequest<{
      Params: { id: number };
      Querystring: { page?: number; limit?: number };
    }, ZodTypeProvider>,
    reply: FastifyReply
  ) => {
    try {
      const sessionId = request.params.id;
      const { page = 1, limit = 10 } = request.query;
      
      const result = await this.studySessionService.getStudySessionWords(sessionId, page, limit);
      return reply.send(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Study session not found') {
        return reply.status(404).send({ error: 'Study session not found' });
      }
      throw error;
    }
  };
  
  

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
    request: FastifyRequest<{ Params: StudySessionParamsSchema }, ZodTypeProvider>,
    reply: FastifyReply
  ) => {
    try {
      const id = Number(request.params.id);
      const session = await this.studySessionService.findById(id);
  
      console.log("SESSSSSSSION:", session); // ✅ Debugging log
      return reply.status(200).send(session); // ✅ This actually sends the response!
      
    } catch (error) {
      if (error instanceof Error && error.message === 'Study session not found') {
        return reply.status(404).send({ error: 'Study session not found' });
      } 
      throw error;
    }
  };

  reviewWord = async (
    request: FastifyRequest<{
      Params: { id: number; word_id: number };
      Body: { correct: boolean };
    }, ZodTypeProvider>, // ✅ Added ZodTypeProvider for schema validation
    reply: FastifyReply
  ) => {
    try {
      console.log("🟢 Received Review Request:", request.params, request.body);
  
      // 🔥 Check if `studySessionService` is correctly initialized
      if (!this.studySessionService) {
        console.error("❌ ERROR: `studySessionService` is undefined!");
        return reply.status(500).send({ error: "Internal Server Error: `studySessionService` is undefined" });
      }
  
      // 🔥 Check if `addReview` exists
      if (typeof this.studySessionService.addReview !== "function") {
        console.error("❌ ERROR: `addReview` method does not exist in `studySessionService`!");
        return reply.status(500).send({ error: "Internal Server Error: `addReview` method is missing" });
      }
  
      const { id, word_id } = request.params;
      const { correct } = request.body;
  
      // Call the service method
      const review = await this.studySessionService.addReview(id, word_id, correct);
  
      return reply.status(201).send(review);
    } catch (error) {
      console.error("❌ ERROR in reviewWord:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return reply.status(404).send({ error: "Study session or word not found" });
      }
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  };
  
}
