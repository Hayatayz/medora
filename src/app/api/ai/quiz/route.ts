import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { generateWithGemini } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId, chapterId, count = 10 } = await request.json();

    let content = "";
    let title = "";

    if (chapterId) {
      const chapter = await db.chapter.findFirst({ where: { id: chapterId } });
      if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
      content = chapter.content.slice(0, 5000);
      title = chapter.title;
    } else {
      const book = await db.book.findFirst({ where: { id: bookId } });
      const chapters = await db.chapter.findMany({
        where: { bookId },
        orderBy: { orderIndex: "asc" },
        take: 2,
      });
      content = chapters.map((c) => c.content).join("\n\n").slice(0, 5000);
      title = book?.title ?? "Quiz";
    }

    const prompt = `Generate exactly ${count} multiple choice questions from this academic content.
Return ONLY a valid JSON array with no extra text:
[{
  "question": "question text",
  "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
  "answer": "A) option1",
  "explanation": "brief explanation why this is correct"
}]

Content (${title}):
${content}`;

    const raw = await generateWithGemini(prompt);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Invalid AI response format");

    const questions = JSON.parse(jsonMatch[0]) as Array<{
      question: string;
      options: string[];
      answer: string;
      explanation?: string;
    }>;

    const quiz = await db.quiz.create({
      data: {
        bookId,
        chapterId: chapterId ?? null,
        title: `Quiz: ${title}`,
        questions: {
          create: questions.slice(0, count).map((q, i) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation ?? "",
            orderIndex: i,
          })),
        },
      },
      include: { questions: { orderBy: { orderIndex: "asc" } } },
    });

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "AI service unavailable. Check your GEMINI_API_KEY." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

    const quizzes = await db.quiz.findMany({
      where: { bookId },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
        quizAttempts: {
          where: { userId: payload.userId },
          orderBy: { completedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error("Quiz GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
