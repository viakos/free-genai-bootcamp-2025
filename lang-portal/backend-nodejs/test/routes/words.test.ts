import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

declare var app: FastifyInstance;
declare var prisma: PrismaClient;

describe('Word Routes', () => {
  beforeEach(async () => {
    // Clean up the database before each test
    await prisma.word.deleteMany();
  });

  describe('POST /api/v1/words', () => {
    it('should create a new word', async () => {
      const word = {
        thai: 'สวัสดี',
        english: 'hello',
        romanized: 'sawadee',
        example: 'สวัสดีครับ/ค่ะ',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/words',
        payload: word,
      });

      expect(response.statusCode).toBe(201);
      const result = JSON.parse(response.payload);
      expect(result.thai).toBe(word.thai);
      expect(result.english).toBe(word.english);
      expect(result.romanized).toBe(word.romanized);
      expect(result.example).toBe(word.example);
    });

    it('should return 400 for invalid word data', async () => {
      const invalidWord = {
        english: 'hello',
        // Missing required fields
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/words',
        payload: invalidWord,
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/words', () => {
    beforeEach(async () => {
      // Add some test data
      await prisma.word.createMany({
        data: [
          {
            thai: 'สวัสดี',
            english: 'hello',
            romanized: 'sawadee',
            example: 'สวัสดีครับ/ค่ะ',
          },
          {
            thai: 'ขอบคุณ',
            english: 'thank you',
            romanized: 'khob khun',
            example: 'ขอบคุณมาก',
          },
        ],
      });
    });

    it('should return a list of words with pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/words?page=1&limit=10',
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.words).toHaveLength(2);
      expect(result.pagination.current_page).toBe(1);
      expect(result.pagination.total_items).toBe(2);
    });

    it('should filter words by search term', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/words?search=hello',
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.words).toHaveLength(1);
      expect(result.words[0].english).toBe('hello');
    });
  });

  describe('GET /api/v1/words/:id', () => {
    let wordId: number;

    beforeEach(async () => {
      // Create a test word
      const word = await prisma.word.create({
        data: {
          thai: 'สวัสดี',
          english: 'hello',
          romanized: 'sawadee',
          example: 'สวัสดีครับ/ค่ะ',
        },
      });
      wordId = word.id;
    });

    it('should return a word by id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/words/${wordId}`,
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.thai).toBe('สวัสดี');
      expect(result.english).toBe('hello');
    });

    it('should return 404 for non-existent word', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/words/999999',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/words/:id', () => {
    let wordId: number;

    beforeEach(async () => {
      const word = await prisma.word.create({
        data: {
          thai: 'สวัสดี',
          english: 'hello',
          romanized: 'sawadee',
          example: 'สวัสดีครับ/ค่ะ',
        },
      });
      wordId = word.id;
    });

    it('should update a word', async () => {
      const update = {
        example: 'สวัสดีตอนเช้า',
      };

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/words/${wordId}`,
        payload: update,
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.example).toBe(update.example);
    });
  });

  describe('DELETE /api/v1/words/:id', () => {
    let wordId: number;

    beforeEach(async () => {
      const word = await prisma.word.create({
        data: {
          thai: 'สวัสดี',
          english: 'hello',
          romanized: 'sawadee',
          example: 'สวัสดีครับ/ค่ะ',
        },
      });
      wordId = word.id;
    });

    it('should delete a word', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/words/${wordId}`,
      });

      expect(response.statusCode).toBe(204);

      // Verify word is deleted
      const word = await prisma.word.findUnique({
        where: { id: wordId },
      });
      expect(word).toBeNull();
    });
  });
});
