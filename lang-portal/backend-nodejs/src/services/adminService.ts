import { PrismaClient } from '@prisma/client';

export class AdminService {
  constructor(private prisma: PrismaClient) {}

  async resetHistory() {
    console.log("Resetting history");

    // ✅ Use a transaction to ensure all or nothing
    await this.prisma.$transaction([
      // ✅ Delete all study results
      this.prisma.studyResult.deleteMany({}),
      // ✅ Delete all word reviews
      this.prisma.wordReview.deleteMany({}),
      // ✅ Delete all study sessions
      this.prisma.studySession.deleteMany({}),
      // ✅ Reset word review stats instead of Word
      this.prisma.wordReview.updateMany({
        data: {
          correctCount: 0,
          wrongCount: 0,
          lastReviewed: new Date(), // Optional: reset the last reviewed date
        }
      })
    ]);

    console.log("✅ Study history has been successfully reset.");
  }
}
