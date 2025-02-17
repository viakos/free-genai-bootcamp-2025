import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { GroupController } from '../controllers/groupController';
import { GroupService } from '../services/groupService';
import {
  groupSchema,
  groupParamsSchema,
  groupQuerySchema,
  addWordsToGroupSchema,
  groupJsonSchema,
  groupParamsJsonSchema,
  groupQueryJsonSchema,
  addWordsToGroupJsonSchema,
} from '../schemas/group';

export async function groupRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();
  const groupService = new GroupService(fastify.prisma);
  const groupController = new GroupController(groupService);

  server.get(
    '/api/v1/groups',
    {
      schema: {
        querystring: groupQueryJsonSchema,
        tags: ['groups'],
        summary: 'Get all groups',
        response: {
          200: {
            type: 'object',
            properties: {
              groups: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    description: { type: ['string', 'null'] },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                    _count: {
                      type: 'object',
                      properties: {
                        words: { type: 'number' },
                        studySessions: { type: 'number' },
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
    groupController.getGroups,
  );

  server.get(
    '/api/v1/groups/:id',
    {
      schema: {
        params: groupParamsJsonSchema,
        tags: ['groups'],
        summary: 'Get a group by ID',
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              description: { type: ['string', 'null'] },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              words: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    word: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        thai: { type: 'string' },
                        english: { type: 'string' },
                        romanized: { type: 'string' },
                        ipa: { type: 'string' },
                        example: { type: ['string', 'null'] },
                      },
                    },
                    addedAt: { type: 'string' },
                  },
                },
              },
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
    groupController.getGroup,
  );

  server.post(
    '/api/v1/groups',
    {
      schema: {
        body: groupJsonSchema,
        tags: ['groups'],
        summary: 'Create a new group',
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              description: { type: ['string', 'null'] },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    groupController.createGroup,
  );

  fastify.patch(
    '/api/v1/groups/:id',
    {
      schema: {
        params: groupParamsJsonSchema,
        body: {
          ...groupJsonSchema,
          required: []
        },
        tags: ['groups'],
        summary: 'Update a group',
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              description: { type: ['string', 'null'] },
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
    groupController.updateGroup,
  );

  server.delete(
    '/api/v1/groups/:id',
    {
      schema: {
        params: groupParamsJsonSchema,
        tags: ['groups'],
        summary: 'Delete a group',
        response: {
          204: {
            type: 'null',
            description: 'Group successfully deleted',
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
    groupController.deleteGroup,
  );

  server.post(
    '/api/v1/groups/:id/words',
    {
      schema: {
        params: groupParamsJsonSchema,
        body: addWordsToGroupJsonSchema,
        tags: ['groups'],
        summary: 'Add words to a group',
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              description: { type: ['string', 'null'] },
              words: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    word: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        thai: { type: 'string' },
                        english: { type: 'string' },
                        romanized: { type: 'string' },
                        ipa: { type: 'string' },
                      },
                    },
                  },
                },
              },
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
    groupController.addWordsToGroup,
  );

  server.delete(
    '/api/v1/groups/:id/words',
    {
      schema: {
        params: groupParamsJsonSchema,
        body: addWordsToGroupJsonSchema,
        tags: ['groups'],
        summary: 'Remove words from a group',
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              description: { type: ['string', 'null'] },
              words: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    word: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        thai: { type: 'string' },
                        english: { type: 'string' },
                        romanized: { type: 'string' },
                        ipa: { type: 'string' },
                      },
                    },
                  },
                },
              },
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
    groupController.removeWordsFromGroup,
  );

  server.get(
    '/api/v1/groups/:id/words',
    {
      schema: {
        params: groupParamsJsonSchema,
        tags: ['groups'],
        summary: 'Get words in a group',
        response: {
          200: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    thai: { type: 'string' },
                    english: { type: 'string' },
                    romanized: { type: 'string' },
                    correct_count: { type: 'number' },
                    wrong_count: { type: 'number' }
                  }
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  current_page: { type: 'number' },
                  total_pages: { type: 'number' },
                  total_items: { type: 'number' },
                  items_per_page: { type: 'number' }
                }
              }
            }
          }
        }
      }
    },
    groupController.getGroupWords
  );

  server.get(
    '/api/v1/groups/:id/study-sessions',
    {
      schema: {
        params: groupParamsJsonSchema,
        tags: ['groups'],
        summary: 'Get study sessions for a group',
        response: {
          200: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    activity_name: { type: 'string' },
                    group_name: { type: 'string' },
                    start_time: { type: 'string', format: 'date-time' },
                    end_time: { type: ['string', 'null'], format: 'date-time' }
                  }
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  current_page: { type: 'number' },
                  total_pages: { type: 'number' },
                  total_items: { type: 'number' },
                  items_per_page: { type: 'number' }
                }
              }
            }
          }
        }
      }
    },
    groupController.getGroupStudySessions
  );
}
