import { PrismaClient } from '@prisma/client';

export class DashboardService {
  constructor(private prisma: PrismaClient) {}

  async getStudyProgress() {
    const [totalWords, studiedWords] = await Promise.all([
      this.prisma.word.count(),
      this.prisma.wordReview.count({
        where: {
          OR: [
            { correctCount: { gt: 0 } },
            { wrongCount: { gt: 0 } },
          ],
        },
      }),
    ]);
  
    return {
      total_words_studied: studiedWords,
      total_available_words: totalWords,
    };
  }
  

  async getQuickStats() {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const last30Days = new Date(now.setDate(now.getDate() - 30));
  
    const [studyResults, totalSessions, activeGroups, recentSessions] = await Promise.all([
      // ✅ Fix: Change `isCorrect` to `correct`
      this.prisma.studyResult.findMany({
        where: {
          createdAt: {
            gte: last30Days,
          },
        },
        select: {
          correct: true,  // ✅ Use `correct`, NOT `isCorrect`
        },
      }),
      // Get total study sessions
      this.prisma.studySession.count(),
      // Get active groups (groups with at least one study session)
      this.prisma.group.count({
        where: {
          studySessions: {
            some: {},
          },
        },
      }),
      // Get recent sessions for streak calculation
      this.prisma.studySession.findMany({
        where: {
          startTime: {
            gte: last30Days,
          },
        },
        select: { startTime: true },
        orderBy: { startTime: 'desc' },
      }),
    ]);
  
    // ✅ Calculate success rate
    const totalAnswers = studyResults.length;
    const correctAnswers = studyResults.filter((r) => r.correct).length;
    const successRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
  
    // ✅ Calculate study streak
    let streakDays = 0;
    let currentDate = startOfToday;
  
    for (const session of recentSessions) {
      const sessionDate = new Date(session.startTime);
      if (sessionDate.toDateString() === currentDate.toDateString()) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
  
    return {
      success_rate: Math.round(successRate),
      total_study_sessions: totalSessions,
      total_active_groups: activeGroups,
      study_streak_days: streakDays,
    };
  }
  
}
