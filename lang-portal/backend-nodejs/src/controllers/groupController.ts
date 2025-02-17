import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { GroupService } from '../services/groupService';
import {
  GroupSchema,
  GroupParamsSchema,
  GroupQuerySchema,
  AddWordsToGroupSchema,
} from '../schemas/group';

export class GroupController {
  constructor(private groupService: GroupService) {}

  getGroups = async (
    request: FastifyRequest<{
      Querystring: GroupQuerySchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    const { page, limit } = request.query;
    const result = await this.groupService.findAll(page, limit);
    return reply.send(result);
  };

  getGroup = async (
    request: FastifyRequest<{
      Params: GroupParamsSchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      const { id } = request.params;
      const group = await this.groupService.findById(id);
      return reply.send(group);
    } catch (error) {
      if (error instanceof Error && error.message === 'Group not found') {
        return reply.status(404).send({ error: 'Group not found' });
      }
      throw error;
    }
  };

  createGroup = async (
    request: FastifyRequest<{
      Body: GroupSchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    const group = await this.groupService.create(request.body);
    return reply.status(201).send(group);
  };

  updateGroup = async (
    request: FastifyRequest<{
      Params: GroupParamsSchema;
      Body: Partial<GroupSchema>;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      const { id } = request.params;
      const group = await this.groupService.update(id, request.body);
      return reply.send(group);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        return reply.status(404).send({ error: 'Group not found' });
      }
      throw error;
    }
  };

  deleteGroup = async (
    request: FastifyRequest<{
      Params: GroupParamsSchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      const { id } = request.params;
      await this.groupService.delete(id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return reply.status(404).send({ error: 'Group not found' });
      }
      throw error;
    }
  };

  addWordsToGroup = async (
    request: FastifyRequest<{
      Params: GroupParamsSchema;
      Body: AddWordsToGroupSchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      const { id } = request.params;
      const { wordIds } = request.body;
      const group = await this.groupService.addWords(id, wordIds);
      return reply.send(group);
    } catch (error) {
      if (error instanceof Error && error.message === 'Group not found') {
        return reply.status(404).send({ error: 'Group not found' });
      }
      throw error;
    }
  };

  removeWordsFromGroup = async (
    request: FastifyRequest<{
      Params: GroupParamsSchema;
      Body: AddWordsToGroupSchema;
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      const { id } = request.params;
      const { wordIds } = request.body;
      const group = await this.groupService.removeWords(id, wordIds);
      return reply.send(group);
    } catch (error) {
      if (error instanceof Error && error.message === 'Group not found') {
        return reply.status(404).send({ error: 'Group not found' });
      }
      throw error;
    }
  };

  getGroupWords = async (
    request: FastifyRequest<{
      Params: GroupParamsSchema;
      Querystring: { page?: number; limit?: number };
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    const id = Number(request.params.id);
    const { page = 1, limit = 10 } = request.query;
    const words = await this.groupService.findGroupWords(id, page, limit);
    return reply.send(words);
  };

  getGroupStudySessions = async (
    request: FastifyRequest<{
      Params: GroupParamsSchema;
      Querystring: { page?: number; limit?: number };
    }, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    const id = Number(request.params.id);
    const { page = 1, limit = 10 } = request.query;
    const sessions = await this.groupService.findGroupStudySessions(id, page, limit);
    return reply.send(sessions);
  };
}
