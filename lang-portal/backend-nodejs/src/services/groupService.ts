import { PrismaClient } from '@prisma/client';
import { GroupSchema } from '../schemas/group';

export class GroupService {
  constructor(private prisma: PrismaClient) {}

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              words: true as const,
              studySessions: true as const,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.group.count(),
    ]);

    return {
      groups,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    };
  }

  async findById(id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        words: {
          include: {
            word: true as const,
          },
        },
        studySessions: {
          take: 5,
          orderBy: { startTime: 'desc' },
          include: {
            activity: true as const,
          },
        },
      },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    return group;
  }

  async create(data: GroupSchema) {
    return this.prisma.group.create({
      data,
    });
  }

  async update(id: number, data: Partial<GroupSchema>) {
    return this.prisma.group.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.group.delete({
      where: { id },
    });
  }

  async addWords(groupId: number, wordIds: number[]) {
    const data = wordIds.map((wordId) => ({
      groupId,
      wordId,
    }));

    await this.prisma.wordsInGroups.createMany({
      data,
      skipDuplicates: true,
    });

    return this.findById(groupId);
  }

  async removeWords(groupId: number, wordIds: number[]) {
    await this.prisma.wordsInGroups.deleteMany({
      where: {
        groupId,
        wordId: {
          in: wordIds,
        },
      },
    });

    return this.findById(groupId);
  }
}
