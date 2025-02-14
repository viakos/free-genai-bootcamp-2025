import { PrismaClient } from '@prisma/client';
import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';
import { execSync } from 'child_process';
import { unlinkSync } from 'fs';

declare global {
  var prisma: PrismaClient;
  var app: FastifyInstance;
}

beforeAll(async () => {
  // Reset the test database
  try {
    unlinkSync('./test.db');
  } catch (error) {
    // Ignore if file doesn't exist
  }

  // Push the schema to the test database
  execSync('npx prisma db push', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });

  global.app = await buildApp();
  global.prisma = global.app.prisma;
});

beforeEach(async () => {
  // Clear all tables before each test
  const tablenames = await global.prisma.$queryRaw<
    Array<{ name: string }>
  >`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';`;

  for (const { name } of tablenames) {
    await global.prisma.$executeRawUnsafe(`DELETE FROM ${name};`);
  }
});

afterAll(async () => {
  await global.app.close();
  await global.prisma.$disconnect();

  // Clean up the test database
  try {
    unlinkSync('./test.db');
  } catch (error) {
    // Ignore if file doesn't exist
  }
});
