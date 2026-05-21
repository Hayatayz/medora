import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { quizId, score, totalQuestions, timeTaken, answers } = await request.json();

    const attempt = await db.quizAttempt.create({
      data: {
        userId: payload.userId,
        quizId,
        score,
        totalQuestions,
        timeTaken: timeTaken ?? null,
        answers: answers ?? [],
        completedAt: new Date(),
      },
    });

    // Update study statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.studyStatistics.upsert({
      where: { userId_date: { userId: payload.userId, date: today } },
      update: { quizzesTaken: { increment: 1 } },
      create: {
        userId: payload.userId,
        date: today,
        quizzesTaken: 1,
      },
    });

    return NextResponse.json({ attempt }, { status: 201 });
  } catch (error) {
    console.error("Quiz attempt error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
