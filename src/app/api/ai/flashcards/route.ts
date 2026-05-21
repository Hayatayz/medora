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

    // Return existing if already generated
    const existing = await db.flashcard.findMany({
      where: { bookId, chapterId: chapterId ?? null },
      take: count,
    });
    if (existing.length >= count) return NextResponse.json({ flashcards: existing });

    let content = "";
    let chapterTitle = "";

    if (chapterId) {
      const chapter = await db.chapter.findFirst({ where: { id: chapterId } });
      if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
      content = chapter.content.slice(0, 5000);
      chapterTitle = chapter.title;
    } else {
      const chapters = await db.chapter.findMany({
        where: { bookId },
        orderBy: { orderIndex: "asc" },
        take: 2,
      });
      content = chapters.map((c) => c.content).join("\n\n").slice(0, 5000);
    }

    const prompt = `Generate exactly ${count} flashcards from this academic content.
Return ONLY a valid JSON array with no extra text, in this exact format:
[{"front": "question or term", "back": "answer or definition", "difficulty": "EASY|MEDIUM|HARD"}]

Content${chapterTitle ? ` (${chapterTitle})` : ""}:
${content}`;

    const raw = await generateWithGemini(prompt);

    // Extract JSON from response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Invalid AI response format");

    const cards = JSON.parse(jsonMatch[0]) as Array<{
      front: string;
      back: string;
      difficulty: string;
    }>;

    const flashcards = await db.flashcard.createManyAndReturn({
      data: cards.slice(0, count).map((c) => ({
        bookId,
        chapterId: chapterId ?? null,
        front: c.front,
        back: c.back,
        difficulty: (["EASY", "MEDIUM", "HARD"].includes(c.difficulty)
          ? c.difficulty
          : "MEDIUM") as "EASY" | "MEDIUM" | "HARD",
      })),
    });

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error("Flashcards error:", error);
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
    const chapterId = searchParams.get("chapterId");

    if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

    const flashcards = await db.flashcard.findMany({
      where: { bookId, ...(chapterId ? { chapterId } : {}) },
      include: {
        progress: { where: { userId: payload.userId }, take: 1 },
      },
    });

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error("Flashcards GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
