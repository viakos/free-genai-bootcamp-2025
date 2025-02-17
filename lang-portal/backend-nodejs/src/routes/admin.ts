import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AdminService } from '../services/adminService.js';

export async function adminRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const adminService = new AdminService(fastify.prisma);

  server.post(
    '/api/v1/reset-history',
    {
      schema: {
        tags: ['admin'],
        summary: 'Reset all study history',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }
            }
          },
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        console.log("Route reset history");
        await adminService.resetHistory();
        return reply.send({
          success: true,
          message: 'Study history has been reset'
        });
      } catch (error) {
        console.error('Failed to reset history:', error);
        return reply.status(500).send({
          success: false,
          message: 'Failed to reset study history'
        });
      }
    }
  );
} 