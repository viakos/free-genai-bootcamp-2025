import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { DashboardService } from '../services/dashboardService';

export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  getStudyProgress = async (
    _request: FastifyRequest<{}, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    const progress = await this.dashboardService.getStudyProgress();
    return reply.send(progress);
  };

  getQuickStats = async (
    _request: FastifyRequest<{}, ZodTypeProvider>,
    reply: FastifyReply,
  ) => {
    const stats = await this.dashboardService.getQuickStats();
    return reply.send(stats);
  };
}
