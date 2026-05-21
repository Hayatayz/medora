import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = payload.userId;

    const [booksCount, statsRows, quizAttempts, flashcardProgress] =
      await Promise.all([
        db.book.count({ where: { userId } }),
        db.studyStatistics.findMany({
          where: { userId },
          orderBy: { date: "desc" },
          take: 7,
        }),
        db.quizAttempt.count({ where: { userId } }),
        db.flashcardProgress.count({ where: { userId } }),
      ]);

    const studyMinutes = statsRows.reduce((sum, s) => sum + s.studyMinutes, 0);
    const pomodorosCompleted = statsRows.reduce(
      (sum, s) => sum + s.pomodorosCompleted,
      0
    );
    const streakDay = statsRows[0]?.streakDay ?? 0;

    const today = new Date();
    const weekData = Array(7)
      .fill(false)
      .map((_, i) => {
        const day = new Date(today);
        day.setDate(today.getDate() - (6 - i));
        const dateStr = day.toISOString().split("T")[0];
        return statsRows.some(
          (s) =>
            s.date.toISOString().split("T")[0] === dateStr &&
            s.studyMinutes > 0
        );
      });

    return NextResponse.json({
      booksRead: booksCount,
      flashcardsStudied: flashcardProgress,
      quizzesTaken: quizAttempts,
      studyMinutes,
      pomodorosCompleted,
      streakDay,
      weekData,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}