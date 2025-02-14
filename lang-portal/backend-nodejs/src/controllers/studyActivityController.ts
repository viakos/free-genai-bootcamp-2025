import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { StudyActivityService } from '../services/studyActivityService.js';
import {
  StudyActivitySchema,
  StudyActivityParamsSchema,
  StudyActivityQuerySchema,
} from '../schemas/studyActivity.js';

export class StudyActivityController {
  constructor(private studyActivityService: StudyActivityService) {}

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
