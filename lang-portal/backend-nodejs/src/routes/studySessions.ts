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
    "/api/study_sessions/:id/words",
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
    "/api/study_sessions/:id/words/:word_id/review",
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
}