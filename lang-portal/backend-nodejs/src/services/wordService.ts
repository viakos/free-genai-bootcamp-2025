import { PrismaClient } from '@prisma/client';
import { WordSchema } from '../schemas/word';

export class WordService {
  constructor(private prisma: PrismaClient) {}

  async findAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { thai: { contains: search } },
            { english: { contains: search } },
            { romanized: { contains: search } },
          ],
        }
      : {};

    const [words, total] = await Promise.all([
      this.prisma.word.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { thai: 'asc' },
      }),
      this.prisma.word.count({ where }),
    ]);

    return {
      words,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    };
  }

  async findById(id: number) {
    const word = await this.prisma.word.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        wordGroups: {
          include: {
            group: true
          }
        }
      }
    });

    if (!word) {
      throw new Error('Word not found');
    }

    return word;
  }

  async create(data: WordSchema) {
    return this.prisma.word.create({
      data,
    });
  }

  async update(id: number, data: Partial<WordSchema>) {
    return this.prisma.word.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.word.delete({
      where: { id },
    });
  }

  async updateStudyResult(id: number, isCorrect: boolean) {
    return this.prisma.word.update({
      where: { id },
      data: {
        ...(isCorrect
          ? { correctCount: { increment: 1 } }
          : { wrongCount: { increment: 1 } }),
      },
    });
  }
}
