import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { GroupController } from '../controllers/groupController';
import { GroupService } from '../services/groupService';
import {
  groupParamsSchema,
  groupQuerySchema,
  groupParamsJsonSchema,
  groupQueryJsonSchema,
  GroupParamsSchema,
  GroupQuerySchema
} from '../schemas/group';

export async function groupRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const groupService = new GroupService(fastify.prisma); // ✅ Ensure service is instantiated
  const groupController = new GroupController(groupService);

  server.get(
    '/api/v1/groups',
    {
      schema: {
        querystring: groupQueryJsonSchema,
        tags: ['groups'],
        summary: 'Get all groups',
      },
    },
    async (request: FastifyRequest<{ Querystring: GroupQuerySchema }>, reply: FastifyReply) => {
      return groupController.getGroups(request, reply);
    }
  );

  server.get(
    '/api/v1/groups/:id',
    {
      schema: {
        params: groupParamsJsonSchema,
        tags: ['groups'],
        summary: 'Get a group by ID',
      },
    },
    async (request: FastifyRequest<{ Params: GroupParamsSchema }>, reply: FastifyReply) => {
      return groupController.getGroup(request, reply);
    }
  );

  server.get(
    '/api/v1/groups/:id/words',
    {
      schema: {
        params: groupParamsJsonSchema,
        querystring: groupQueryJsonSchema,
        tags: ['groups'],
        summary: 'Get words in a group',
      },
    },
    async (request: FastifyRequest<{ Params: GroupParamsSchema; Querystring: GroupQuerySchema }>, reply: FastifyReply) => {
      return groupController.getGroupWords(request, reply);
    }
  );

  server.get(
    '/api/v1/groups/:id/study-sessions',
    {
      schema: {
        params: groupParamsJsonSchema,
        querystring: groupQueryJsonSchema,
        tags: ['groups'],
        summary: 'Get study sessions for a group',
      },
    },
    async (request: FastifyRequest<{ Params: GroupParamsSchema; Querystring: GroupQuerySchema }>, reply: FastifyReply) => {
      return groupController.getGroupStudySessions(request, reply);
    }
  );
}
