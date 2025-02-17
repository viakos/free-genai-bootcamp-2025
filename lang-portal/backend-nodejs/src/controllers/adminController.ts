import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AdminService } from '../services/adminService';

export class AdminController {
  constructor(private adminService: AdminService) {}

  resetHistory = async (
    _request: FastifyRequest<{}, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    try {
      console.log("Controller - reset history")
      await this.adminService.resetHistory();
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
  };
} 