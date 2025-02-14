import { PrismaClient } from '@prisma/client';
import { StudySessionSchema, StudyResultSchema } from '../schemas/studySession';

export class StudySessionService {
  constructor(private prisma: PrismaClient) {}

  

  async findAll(page: number, limit: number, activityId?: number, groupId?: number) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(activityId && { studyActivityId: activityId }), // ✅ Ensure the correct column name
      ...(groupId && { groupId }),
    };

    const [sessions, total] = await Promise.all([
      this.prisma.studySession.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          studyActivity: { select: { name: true } },
          group: { select: { name: true } },
          _count: {
            select: { studyResults: true }
          }
        },
        orderBy: { startTime: 'desc' }
      }),
      this.prisma.studySession.count({ where })
    ]);

    console.log("Fetched Sessions:", JSON.stringify(sessions, null, 2)); // ✅ Debugging log

    const items = sessions.map(session => ({
      id: session.id,
      activity_name: session.studyActivity?.name || "Unknown Activity",
      group_name: session.group?.name || "Unknown Group",
      start_time: session.startTime.toISOString(),
      end_time: session.endTime ? session.endTime.toISOString() : null,
      review_items_count: session._count.studyResults || 0,
    }));

    console.log("Response Items:", JSON.stringify(items, null, 2)); // ✅ Log response

    return {
      sessions: sessions ?? [], // ✅ Ensure `items` is in the response
      pagination: {
        current_page: pageNum,
        total_pages: Math.ceil(total / limitNum),
        total_items: total,
        items_per_page: limitNum,
      },
    };
}

async findById(id: number) {
  const session = await this.prisma.studySession.findUnique({
    where: { id },
    include: {
      studyActivity: { select: { name: true } }, // ✅ Selects activity name
      group: { select: { name: true } },         // ✅ Selects group name
      studyResults: { select: { id: true } },    // ✅ Counts study results
    },
  });

  if (!session) {
    throw new Error('Study session not found');
  }

  console.log("SESSION DATA:", session); // ✅ Debugging log to check fetched data

  return {
    id: session.id,
    activity_name: session.studyActivity?.name || "Unknown Activity",
    group_name: session.group?.name || "Unknown Group",
    start_time: session.startTime ? session.startTime.toISOString() : null,
    end_time: session.endTime ? session.endTime.toISOString() : null,
    review_items_count: session.studyResults.length || 0, // ✅ Fix count return
  };
}


  async create(data: StudySessionSchema) {
    return this.prisma.studySession.create({
      data,
      include: {
        studyActivity: true,
        group: true,
      },
    });
  }

  async end(id: number) {
    return this.prisma.studySession.update({
      where: { id },
      data: {
        endTime: new Date(),
      },
    });
  }

  async addResult(sessionId: number, result: StudyResultSchema) {
    // Create study result
    const studyResult = await this.prisma.studyResult.create({
      data: {
        sessionId,
        ...result,
      },
    });

    // Update word stats
    await this.prisma.word.update({
      where: { id: result.wordId },
      data: {
        ...(result.isCorrect
          ? { correctCount: { increment: 1 } }
          : { wrongCount: { increment: 1 } }),
      },
    });

    return studyResult;
  }

  async getSessionStats(id: number) {
    const results = await this.prisma.studyResult.groupBy({
      by: ['isCorrect'],
      where: {
        sessionId: id,
      },
      _count: true as const,
    });

    const correct = results.find((r) => r.isCorrect)?._count ?? 0;
    const incorrect = results.find((r) => !r.isCorrect)?._count ?? 0;
    const total = correct + incorrect;

    return {
      total_questions: total,
      correct_answers: correct,
      incorrect_answers: incorrect,
      accuracy: total > 0 ? (correct / total) * 100 : 0,
    };
  }

  async getStudySessionWords(sessionId: number) {
    console.log("SESSION ID in service:", sessionId);
    return this.prisma.wordReview.findMany({
      where: { studySessionId: sessionId },
      select: { 
        word: {
          select: {
            thai: true,
            romanized: true,
            english: true,
          },
        },
        correct_count: true,
        wrong_count: true,
      },
    }).then(results => results.map(r => ({
      thai: r.word.thai,
      romanized: r.word.romanized,
      english: r.word.english,
      correct_count: r.correct_count,
      wrong_count: r.wrong_count,
    })));
  }  

  async getLastSession() {
    return this.prisma.studySession.findFirst({
      orderBy: { startTime: 'desc' },
      include: {
        studyActivity: true,
        group: true,
      },
    });
  }

  /**
   * Records a review for a word in a study session
   * @param sessionId - The ID of the study session
   * @param wordId - The ID of the word being reviewed
   * @param isCorrect - Whether the review was correct
   * @returns The created word review record
   */
  async addReview(sessionId: number, wordId: number, isCorrect: boolean) {
    // First check if session exists and is not ended
    const session = await this.prisma.studySession.findUnique({
      where: { id: sessionId },
      select: { endTime: true }
    });

    if (!session) {
      throw new Error('Study session not found');
    }

    if (session.endTime) {
      throw new Error('Cannot add review to ended session');
    }

    // Create or update the word review
    const review = await this.prisma.wordReview.upsert({
      where: {
        studySessionId_wordId: {
          studySessionId: sessionId,
          wordId: wordId,
        },
      },
      update: {
        ...(isCorrect 
          ? { correct_count: { increment: 1 }} 
          : { wrong_count: { increment: 1 }}),
      },
      create: {
        studySessionId: sessionId,
        wordId: wordId,
        correct_count: isCorrect ? 1 : 0,
        wrong_count: isCorrect ? 0 : 1,
      },
    });

    // Also update the word's global stats
    await this.prisma.word.update({
      where: { id: wordId },
      data: {
        ...(isCorrect
          ? { correctCount: { increment: 1 }}
          : { wrongCount: { increment: 1 }}),
      },
    });

    return {
      success: true,
      word_id: wordId,
      study_session_id: sessionId,
      correct: isCorrect,
      created_at: new Date(),
    };
  }
}
