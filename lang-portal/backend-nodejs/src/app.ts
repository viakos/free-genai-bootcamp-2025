import fastify from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import cors from '@fastify/cors';
// import swagger from '@fastify/swagger';
// import swaggerUi from '@fastify/swagger-ui';
import { PrismaClient } from '@prisma/client';
import { wordRoutes } from './routes/words.js';
import { groupRoutes } from './routes/groups.js';
import { studyActivityRoutes } from './routes/studyActivities.js';
import { studySessionRoutes } from './routes/studySessions.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { adminRoutes } from './routes/admin.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export async function buildApp() {
  const app = fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  // Register Prisma
  const prisma = new PrismaClient();
  await prisma.$connect();
  app.decorate('prisma', prisma);
  app.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
  });

  // Register CORS
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Register Swagger
  // Temporarily disabled
  // await app.register(swagger, swaggerOptions);
  // await app.register(swaggerUi, swaggerUiOptions);

  // Register routes
  await app.register(wordRoutes);
  await app.register(groupRoutes);
  await app.register(studyActivityRoutes);
  await app.register(studySessionRoutes);
  await app.register(dashboardRoutes);
  await app.register(adminRoutes);

  return app;
}

// Start the server
const start = async () => {
  try {
    const app = await buildApp();
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    console.log(`Server is running on http://${host}:${port}`);
  } catch (err) {
    console.error('Error starting server:', err);
    if (err.errors) {
        console.error('Validation errors:', JSON.stringify(err.errors, null, 2));
    }
    if (err.code) {
        console.error('Error code:', err.code);
    }
    process.exit(1);
  }
};

start();
