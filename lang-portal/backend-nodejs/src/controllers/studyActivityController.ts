import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { StudyActivityService } from '../services/studyActivityService.js';
import {
  StudyActivitySchema,
  StudyActivityParamsSchema,
  StudyActivityQuerySchema,
} from '../schemas/studyActivity.js';

export class StudyActivityController {
  constructor(private studyActivityService: StudyActivityService) {
    console.log("✅ StudyActivityService Initialized:", studyActivityService);
  }

  getStudyActivities = async (
    request: FastifyRequest<{
      Querystring: StudyActivityQuerySchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    
    const { page, limit } = request.query;
    const result = await this.studyActivityService.findAll(page, limit);
    return reply.send(result);
  };

  getStudySessionsForActivity = async (
    request: FastifyRequest<{ Params: { id: number } }, ZodTypeProvider>,
    reply: FastifyReply
  ) => {
    try {
      const activityId = Number(request.params.id);
      if (isNaN(activityId)) {
        return reply.status(400).send({ error: 'Invalid activity ID' });
      }
  
      console.log("✅ Checking if studyActivityService is defined:", this.studyActivityService);
      console.log("📌 Fetching sessions for activity:", activityId);
  
      if (!this.studyActivityService || !this.studyActivityService.getStudySessionsForActivity) {
        if (!this.studyActivityService) {
          console.error("❌ ERROR: studyActivityService is undefined");
        }
        if (!this.studyActivityService.getStudySessionsForActivity) {
          console.error("❌ ERROR: missing method getStudySessionsForActivity!");
        }
  
        return reply.status(500).send({ error: "Internal Server Error - Service Not Available" });
      }
  
      const sessions = await this.studyActivityService.getStudySessionsForActivity(activityId);
      if (!sessions.length) {
        return reply.status(404).send({ error: 'No study sessions found for this activity' });
      }
  
      return reply.send({
        study_sessions: sessions.map(session => ({
          id: session.id,
          activity_name: session.studyActivity.name,
          group_name: session.group.name,
          start_time: session.startTime ? session.startTime.toISOString() : null,
          end_time: session.endTime ? session.endTime.toISOString() : null,
          review_items_count: session._count.studyResults || 0,
        })),
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_items: sessions.length,
          items_per_page: sessions.length,
        },
      });
  
    } catch (error) {
      console.error("❌ Error fetching study sessions for activity:", error);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  };
  
  
  

  getStudyActivity = async (
    request: FastifyRequest<{
      Params: StudyActivityParamsSchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      const { id } = request.params;
      const activity = await this.studyActivityService.findById(id);
      return reply.send(activity);
    } catch (error) {
      if (error instanceof Error && error.message === 'Study activity not found') {
        return reply.status(404).send({ error: 'Study activity not found' });
      }
      throw error;
    }
  };

  createStudyActivity = async (
    request: FastifyRequest<{
      Body: StudyActivitySchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    const activity = await this.studyActivityService.create(request.body);
    return reply.status(201).send(activity);
  };

  updateStudyActivity = async (
    request: FastifyRequest<{
      Params: StudyActivityParamsSchema;
      Body: Partial<StudyActivitySchema>;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      const { id } = request.params;
      const activity = await this.studyActivityService.update(id, request.body);
      return reply.send(activity);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        return reply.status(404).send({ error: 'Study activity not found' });
      }
      throw error;
    }
  };

  deleteStudyActivity = async (
    request: FastifyRequest<{
      Params: StudyActivityParamsSchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      const { id } = request.params;
      await this.studyActivityService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return reply.status(404).send({ error: 'Study activity not found' });
      }
      throw error;
    }
  };
}
