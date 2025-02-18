import { PrismaClient } from '@prisma/client';
import { GroupSchema } from '../schemas/group';

export class GroupService {
  constructor(private prisma: PrismaClient) {}

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const limitNum = Math.max(1, Number(limit) || 10);

    const [groups, total] = await Promise.all([
      this.prisma.group.findMany({
        skip,
        take: limitNum,
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
      where: { id: Number(id) },
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
            studyActivity: true as const,
          },
        },
      },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    return group;
  }

  async findGroupWords(groupId: number, page: number, limit: number) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const skip = (pageNum - 1) * limitNum;
  
    // Check if group exists
    const groupExists = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
  
    if (!groupExists) {
      throw new Error('Group not found');
    }
  
    // Fetch words in the group
    const [words, total] = await Promise.all([
      this.prisma.wordsInGroups.findMany({
        where: { groupId },
        skip,
        take: limitNum,
        include: {
          word: {
            select: {
              id: true,
              thai: true,
              romanized: true,
              english: true,
              wordReviews: {
                select: {
                  correctCount: true,
                  wrongCount: true,
                },
              },
            },
          },
        },
        orderBy: { addedAt: 'desc' }, // Order by the time words were added
      }),
      this.prisma.wordsInGroups.count({ where: { groupId } }),
    ]);
  
    // Format response
    const items = words.map((entry) => ({
      id: entry.word.id,
      thai: entry.word.thai,
      romanized: entry.word.romanized,
      english: entry.word.english,
      correct_count: entry.word.wordReviews?.correctCount ?? 0,
      wrong_count: entry.word.wordReviews?.wrongCount ?? 0,
    }));
  
    return {
      items,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_items: total,
        items_per_page: limitNum,
      },
    };
  }
  

  async findGroupStudySessions(groupId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const limitNum = Math.max(1, Number(limit));

    const [sessions, total] = await Promise.all([
      this.prisma.studySession.findMany({
        where: { groupId },
        skip,
        take: limitNum,
        include: {
          studyActivity: true,
          group: true,
        },
        orderBy: { startTime: 'desc' }
      }),
      this.prisma.studySession.count({ where: { groupId } })
    ]);

    return {
      items: sessions.map(session => ({
        id: session.id,
        activity_name: session.studyActivity?.name || "Unknown Activity",
        group_name: session.group?.name || "Unknown Group",
        start_time: session.startTime.toISOString(),
        end_time: session.endTime?.toISOString() || null
      })),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limitNum),
        total_items: total,
        items_per_page: limitNum
      }
    };
  }
}
