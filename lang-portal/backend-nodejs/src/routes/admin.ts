import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AdminService } from '../services/adminService.js';
import { AdminController } from '../controllers/adminController.js';

export async function adminRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const adminService = new AdminService(fastify.prisma);
  const adminController = new AdminController(adminService);

  server.post(
    '/api/v1/full-reset',
    {
      schema: {
        tags: ['admin'],
        summary: 'Fully reset the system',
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
    adminController.fullReset // ✅ New full reset method
  );



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
    adminController.resetHistory 
  );
}
