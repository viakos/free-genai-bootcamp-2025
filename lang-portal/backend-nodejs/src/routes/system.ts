import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { SystemController } from '../controllers/systemController.js';
import { SystemService } from '../services/systemService.js';

export async function systemRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const systemService = new SystemService(fastify.prisma);
  const systemController = new SystemController(systemService);

  server.post(
    '/api/reset_history',
    {
      schema: {
        tags: ['system'],
        summary: 'Reset study history',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    systemController.resetHistory
  );

  server.post(
    '/api/full_reset',
    {
      schema: {
        tags: ['system'],
        summary: 'Full system reset',
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    systemController.fullReset
  );
}
