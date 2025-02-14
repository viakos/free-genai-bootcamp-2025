import { PrismaClient } from '@prisma/client';
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';

// Declare Prisma in FastifyInstance
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin: FastifyPluginAsync = fp(async (server) => {
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  await prisma.$connect();

  // Make Prisma available through the fastify server instance
  server.decorate('prisma', prisma);

  server.addHook('onClose', async (server) => {
    await server.prisma.$disconnect();
  });
});
