import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { generateWithGemini } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId, chapterId, type = "CONCISE" } = await request.json();

    // Check if summary already exists
    const existing = await db.summary.findFirst({
      where: { bookId, chapterId: chapterId ?? null, type },
    });
    if (existing) return NextResponse.json({ summary: existing });

    let content = "";
    let title = "";

    if (chapterId) {
      const chapter = await db.chapter.findFirst({ where: { id: chapterId } });
      if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
      content = chapter.content.slice(0, 6000);
      title = chapter.title;
    } else {
      const chapters = await db.chapter.findMany({
        where: { bookId },
        orderBy: { orderIndex: "asc" },
        take: 3,
      });
      content = chapters.map((c) => c.content).join("\n\n").slice(0, 6000);
      const book = await db.book.findFirst({ where: { id: bookId } });
      title = book?.title ?? "Book";
    }

    const prompts: Record<string, string> = {
      CONCISE: `Summarize this academic content in 3-5 bullet points. Be concise and focus on key concepts.\n\nTitle: ${title}\n\nContent:\n${content}`,
      DETAILED: `Create a detailed study summary with sections: Overview, Key Concepts, Important Details, and Takeaways.\n\nTitle: ${title}\n\nContent:\n${content}`,
      KEY_TERMS: `Extract 10-15 key terms and definitions from this academic content. Format as: **Term**: Definition\n\nTitle: ${title}\n\nContent:\n${content}`,
    };

    const summaryText = await generateWithGemini(prompts[type] ?? prompts.CONCISE);

    const summary = await db.summary.create({
      data: {
        bookId,
        chapterId: chapterId ?? null,
        type,
        content: summaryText,
        keyTerms: [],
      },
    });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary error:", error);
    return NextResponse.json(
      { error: "AI service unavailable. Check your GEMINI_API_KEY." },
      { status: 500 }
    );
  }
}
