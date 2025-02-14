import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { DashboardController } from '../controllers/dashboardController';
import { DashboardService } from '../services/dashboardService';

export async function dashboardRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const dashboardService = new DashboardService(fastify.prisma);
  const dashboardController = new DashboardController(dashboardService);

  server.get(
    '/api/v1/dashboard/study-progress',
    {
      schema: {
        tags: ['dashboard'],
        summary: 'Get study progress statistics',
        response: {
          200: {
            type: 'object',
            properties: {
              totalWords: { type: 'number' },
              totalGroups: { type: 'number' },
              totalSessions: { type: 'number' },
              totalStudyTime: { type: 'number' },
              lastWeekProgress: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    date: { type: 'string' },
                    sessionsCount: { type: 'number' },
                    wordsStudied: { type: 'number' },
                    correctCount: { type: 'number' },
                    wrongCount: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    dashboardController.getStudyProgress,
  );

  server.get(
    '/api/v1/dashboard/quick-stats',
    {
      schema: {
        tags: ['dashboard'],
        summary: 'Get quick statistics',
        response: {
          200: {
            type: 'object',
            properties: {
              todaySessionsCount: { type: 'number' },
              todayWordsStudied: { type: 'number' },
              todayAccuracy: { type: 'number' },
              totalSessionsCount: { type: 'number' },
              totalWordsStudied: { type: 'number' },
              totalAccuracy: { type: 'number' },
              streakDays: { type: 'number' },
            },
          },
        },
      },
    },
    dashboardController.getQuickStats,
  );
}