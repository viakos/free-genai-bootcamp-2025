import { FastifySwaggerOptions } from '@fastify/swagger';
import { SwaggerOptions } from '@fastify/swagger-ui';

export const swaggerOptions: FastifySwaggerOptions = {
  swagger: {
    info: {
      title: 'Thai Language Learning API',
      description: 'API for Thai language learning application',
      version: '1.0.0',
    },
    host: `localhost:${process.env.PORT || 3000}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'dashboard', description: 'Dashboard endpoints' },
      { name: 'words', description: 'Word management endpoints' },
      { name: 'groups', description: 'Group management endpoints' },
      { name: 'study-activities', description: 'Study activity endpoints' },
      { name: 'study-sessions', description: 'Study session endpoints' },
      { name: 'system', description: 'System management endpoints' },
    ],
  },
};

export const swaggerUiOptions: SwaggerOptions = {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: true,
};
