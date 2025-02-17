import { PrismaClient } from '@prisma/client';
import { StudyActivitySchema } from '../schemas/studyActivity';

export class StudyActivityService {
  constructor(private prisma: PrismaClient) {}

  async findAll(page: number | string, limit: number | string) {
    // ✅ Ensure page and limit are numbers, defaulting to page=1 and limit=10
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const skip = (pageNum - 1) * limitNum;
  
    const [activities, total] = await Promise.all([
      this.prisma.studyActivity.findMany({
        skip,       // ✅ Now always included
        take: limitNum,  // ✅ Now always a valid integer
        include: {
          _count: {
            select: { sessions: true }
          }
        },
        orderBy: { name: 'asc' }
      }),
      this.prisma.studyActivity.count(),
    ]);
  
    return {
      activities,
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_items: total,
        items_per_page: limitNum,
      },
    };
  }
  
  async getStudySessionsForActivity(activityId: number) {
    console.log("🔍 Fetching study sessions for activity in Service:", activityId);
    return this.prisma.studySession.findMany({
      where: { studyActivityId: activityId },
      include: {
        studyActivity: { select: { name: true } },
        group: { select: { name: true } },
        _count: {
          select: { studyResults: true }
        }
      },
      orderBy: { startTime: 'desc' }
    });
  }
  

  async findById(id: number) {
    const activity = await this.prisma.studyActivity.findUnique({
      where: { id: Number(id) },
      include: {
        sessions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            group: true as const,
          },
        },
      },
    });

    if (!activity) {
      throw new Error('Study activity not found');
    }

    return activity;
  }

  async create(data: StudyActivitySchema) {
    return this.prisma.studyActivity.create({
      data,
    });
  }

  async update(id: number, data: Partial<StudyActivitySchema>) {
    return this.prisma.studyActivity.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.studyActivity.delete({
      where: { id },
    });
  }
}
