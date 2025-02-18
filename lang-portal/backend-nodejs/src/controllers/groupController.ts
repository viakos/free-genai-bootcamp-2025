import { FastifyRequest, FastifyReply } from 'fastify';
import { GroupService } from '../services/groupService';
import { GroupParamsSchema, GroupQuerySchema } from '../schemas/group';

export class GroupController {
  private groupService: GroupService;

  constructor(groupService: GroupService) {
    this.groupService = groupService;
  }

  getGroups = async (
    request: FastifyRequest<{ Querystring: GroupQuerySchema }>,
    reply: FastifyReply
  ) => {
    const { page, limit } = request.query;
    const result = await this.groupService.findAll(Number(page), Number(limit)); // ✅ Ensure page & limit are numbers
    reply.send(result);
  };

  getGroup = async (
    request: FastifyRequest<{ Params: GroupParamsSchema }>,
    reply: FastifyReply
  ) => {
    try {
      const id = Number(request.params.id); // ✅ Convert `id` to number inside the controller
      const group = await this.groupService.findById(id);
      reply.send(group);
    } catch (error) {
      reply.status(404).send({ error: 'Group not found' });
    }
  };

  getGroupWords = async (
    request: FastifyRequest<{ Params: GroupParamsSchema; Querystring: GroupQuerySchema }>,
    reply: FastifyReply
  ) => {
    const id = Number(request.params.id); // ✅ Convert `id`
    const { page, limit } = request.query;
    const words = await this.groupService.findGroupWords(id, Number(page), Number(limit)); // ✅ Fixed method name
    reply.send(words);
  };

  getGroupStudySessions = async (
    request: FastifyRequest<{ Params: GroupParamsSchema; Querystring: GroupQuerySchema }>,
    reply: FastifyReply
  ) => {
    const id = Number(request.params.id); // ✅ Convert `id`
    const { page, limit } = request.query;
    const sessions = await this.groupService.findGroupStudySessions(id, Number(page), Number(limit)); // ✅ Fixed method name
    reply.send(sessions);
  };
}
