import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { StudySessionController } from '../controllers/studySessionController.js';
import { StudySessionService } from '../services/studySessionService.js';
import {
  studySessionSchema,
  studySessionParamsSchema,
  studySessionQuerySchema,
  studyResultSchema,
  studySessionJsonSchema,
  studySessionParamsJsonSchema,
  studySessionQueryJsonSchema,
  studyResultJsonSchema,
} from '../schemas/studySession.js';

export async function studySessionRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const studySessionService = new StudySessionService(fastify.prisma);
  const studySessionController = new StudySessionController(studySessionService);

  server.get(
    '/api/v1/study-sessions',
    {
      schema: {
        querystring: studySessionQueryJsonSchema,
        tags: ['study-sessions'],
        summary: 'Get all study sessions',
        response: {
          200: {
            type: 'object',
            properties: {
              items: {  // ✅ Change from "sessions" to "items"
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    activity_name: { type: 'string' },
                    group_name: { type: 'string' },
                    start_time: { type: 'string' },
                    end_time: { type: ['string', 'null'] },
                    review_items_count: { type: 'number' },
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
    studySessionController.getStudySessions,
  );

  server.get(
    '/api/v1/study-sessions/:id',
    {
      schema: {
        params: studySessionParamsJsonSchema,
        tags: ['study-sessions'],
        summary: 'Get a study session by ID',
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              activity_name: { type: 'string' },  // ✅ Matches response structure
              group_name: { type: 'string' },     // ✅ Matches response structure
              start_time: { type: 'string' },     // ✅ Matches response structure
              end_time: { type: ['string', 'null'] }, // ✅ Matches response structure
              review_items_count: { type: 'number' },
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
    studySessionController.getStudySession,
  );

  server.get(
    "/api/v1/study-sessions/:id/words",
    {
      schema: {
        params: { 
          type: "object",
          properties: {
            id: { type: "number" },
          },
          required: ["id"],
        },
        tags: ["study-sessions"],
        summary: "Get words reviewed in a study session",
        response: {
          200: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    thai: { type: "string" },
                    romanized: { type: "string" },
                    english: { type: "string" },
                    correct_count: { type: "number" },
                    wrong_count: { type: "number" },
                  },
                },
              },
              pagination: {
                type: "object",
                properties: {
                  current_page: { type: "number" },
                  total_pages: { type: "number" },
                  total_items: { type: "number" },
                  items_per_page: { type: "number" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    studySessionController.getStudySessionWords // ✅ Ensure this function exists!
  );

  server.post(
    "/api/v1/study-sessions/:id/words/:word_id/review",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "integer", minimum: 1 }, // Study Session ID
            word_id: { type: "integer", minimum: 1 } // Word ID
          },
          required: ["id", "word_id"]
        },
        body: {
          type: "object",
          properties: {
            correct: { type: "boolean" } // Correct or Incorrect review
          },
          required: ["correct"]
        },
        tags: ["study-sessions"],
        summary: "Submit a review for a word in a study session",
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              word_id: { type: "integer" },
              study_session_id: { type: "integer" },
              correct: { type: "boolean" },
              created_at: { type: "string", format: "date-time" }
            }
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" }
            }
          }
        }
      }
    },
    studySessionController.reviewWord // ✅ Ensure this function exists!
  );

  server.get(
    "/api/v1/dashboard/last_study_session",
    {
      schema: {
        tags: ["dashboard"],
        summary: "Get the last study session",
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "integer" },
              group_id: { type: "integer" },
              created_at: { type: "string", format: "date-time" },
              study_activity_id: { type: "integer" },
              group_name: { type: "string" }
            }
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" }
            }
          }
        }
      }
    },
    async (request, reply) => {
      const lastSession = await studySessionService.getLastSession();
      
      if (!lastSession) {
        return reply.status(404).send({ error: "No study sessions found" });
      }

      return {
        id: lastSession.id,
        group_id: lastSession.groupId,
        created_at: lastSession.createdAt.toISOString(),
        study_activity_id: lastSession.studyActivityId,
        group_name: lastSession.group?.name || "Unknown Group"
      };
    }
  );
}