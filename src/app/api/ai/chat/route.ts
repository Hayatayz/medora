import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { chatWithContext } from "@/lib/ai/openai";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, bookId, chapterId } = await request.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    let context = "";

    if (chapterId) {
      const chapter = await db.chapter.findFirst({
        where: { id: chapterId },
        select: { title: true, content: true },
      });
      if (chapter) {
        context = `Chapter: ${chapter.title}\n\n${chapter.content.slice(0, 3000)}`;
      }
    } else if (bookId) {
      const book = await db.book.findFirst({
        where: { id: bookId, userId: payload.userId },
        select: { title: true, author: true },
      });
      if (book) context = `Book: "${book.title}" by ${book.author ?? "Unknown"}`;
    }

    const systemPrompt = `You are Medora, an expert AI academic study assistant. 
You help students understand complex academic content from their textbooks.
Be concise, clear, and educational. Use bullet points and structure when helpful.
If asked about content outside the provided context, answer from your general knowledge but note it.`;

    const response = await chatWithContext(systemPrompt, message, context);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "AI service unavailable. Check your OPENAI_API_KEY." },
      { status: 500 }
    );
  }
}
