import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { StudyActivityController } from '../controllers/studyActivityController';
import { StudyActivityService } from '../services/studyActivityService.js';
import {
  studyActivitySchema,
  studyActivityParamsSchema,
  studyActivityQuerySchema,
  studyActivityJsonSchema,
  studyActivityParamsJsonSchema,
  studyActivityQueryJsonSchema,
} from '../schemas/studyActivity.js';

export async function studyActivityRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const studyActivityService = new StudyActivityService(fastify.prisma);
  const studyActivityController = new StudyActivityController(studyActivityService);

  server.get(
    '/api/v1/study-activities',
    {
      schema: {
        querystring: studyActivityQueryJsonSchema,
        tags: ['study-activities'],
        summary: 'Get all study activities',
        response: {
          200: {
            type: 'object',
            properties: {
              activities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    thumbnailUrl: { type: ['string', 'null'] },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    _count: {
                      type: 'object',
                      properties: {
                        sessions: { type: 'number' },
                      },
                    },
                  },
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  current_page: { type: 'number' },
                  total_pages: { type: 'number' },
                  total_items: { type: 'number' },
                  items_per_page: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    studyActivityController.getStudyActivities,
  );

  server.get(
    '/api/v1/study-activities/:id',
    {
      schema: {
        params: studyActivityParamsJsonSchema,
        tags: ['study-activities'],
        summary: 'Get a study activity by ID',
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              description: { type: 'string' },
              previewUrl: { type: ['string', 'null'] },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    studyActivityController.getStudyActivity,
  );

  // server.get(
  //   '/api/v1/study-activities/:id/study-sessions',
  //   {
  //     schema: {
  //       params: studyActivityParamsJsonSchema,
  //       tags: ['study-activities'],
  //       summary: 'Get study sessions for a specific activity',
  //       response: {
  //         200: {
  //           type: 'object',
  //           properties: {
  //             study_sessions: {
  //               type: 'array',
  //               items: {
  //                 type: 'object',
  //                 properties: {
  //                   id: { type: 'number' },
  //                   activity_name: { type: 'string' },
  //                   group_name: { type: 'string' },
  //                   start_time: { type: 'string', format: 'date-time' },
  //                   end_time: { type: 'string', format: 'date-time', nullable: true },
  //                   review_items_count: { type: 'number' },
  //                 },
  //               },
  //             },
  //             pagination: {
  //               type: 'object',
  //               properties: {
  //                 current_page: { type: 'number' },
  //                 total_pages: { type: 'number' },
  //                 total_items: { type: 'number' },
  //                 items_per_page: { type: 'number' },
  //               },
  //             },
  //           },
  //         },
  //         404: {
  //           type: 'object',
  //           properties: {
  //             error: { type: 'string' },
  //           },
  //         },
  //       },
  //     },
  //   },
  //   studyActivityController.getStudySessionsForActivity,
  // );
  

  server.post(
    '/api/v1/study-activities',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            group_id: { type: 'number' },
            study_activity_id: { type: 'number' },
          },
          required: ['group_id', 'study_activity_id'],
        },
        tags: ['study-activities'],
        summary: 'Create a new study activity session',
        response: {
          201: {
            type: 'object',
            properties: {
              session_id: { type: 'number' },
              group_id: { type: 'number' },
            },
          },
        },
      },
    },
    studyActivityController.createStudyActivity, // ⬅️ Ensure controller function matches the expected logic
  );

  server.patch(
    '/api/v1/study-activities/:id',
    {
      schema: {
        params: studyActivityParamsJsonSchema,
        body: {
          ...studyActivityJsonSchema,
          required: [],
        },
        tags: ['study-activities'],
        summary: 'Update a study activity',
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              description: { type: 'string' },
              thumbnailUrl: { type: ['string', 'null'] },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    studyActivityController.updateStudyActivity,
  );

  server.delete(
    '/api/v1/study-activities/:id',
    {
      schema: {
        params: studyActivityParamsJsonSchema,
        tags: ['study-activities'],
        summary: 'Delete a study activity',
        response: {
          204: {
            type: 'null',
            description: 'Study activity successfully deleted',
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    studyActivityController.deleteStudyActivity,
  );
}
