import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId, chapterId, message, selectedText } = await request.json();
    if (!message) return NextResponse.json({ error: "No message provided" }, { status: 400 });

    // Get book context
    let context = "";
    try {
      if (chapterId) {
        const chapter = await db.chapter.findUnique({ where: { id: chapterId } });
        if (chapter) context = `Chapter: ${chapter.title}\n\n${chapter.content.slice(0, 3000)}`;
      } else if (bookId) {
        const book = await db.book.findFirst({
          where: { id: bookId },
          include: { chapters: { take: 1, orderBy: { orderIndex: "asc" } } },
        });
        if (book) {
          context = `Book: ${book.title}${book.author ? ` by ${book.author}` : ""}`;
          if (book.chapters[0]) context += `\n\nFirst chapter: ${book.chapters[0].content.slice(0, 2000)}`;
        }
      }
    } catch { /* context is optional */ }

    const systemPrompt = `You are Medora AI, an expert academic study assistant. You help students understand their textbooks deeply.
${context ? `\nContext from the book:\n${context}` : ""}
${selectedText ? `\nSelected text the student is asking about:\n"${selectedText}"` : ""}

Be concise, clear, and educational. Use bullet points and structure when helpful. Always respond in the same language as the student's question.`;

    // Try OpenAI first
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (openaiKey && openaiKey !== "placeholder" && openaiKey.startsWith("sk-")) {
      try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({ apiKey: openaiKey });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });
        const response = completion.choices[0].message.content ?? "No response";
        return NextResponse.json({ response });
      } catch (e) {
        console.error("OpenAI error:", e);
      }
    }

    // Fallback to Gemini
    if (geminiKey && geminiKey !== "placeholder") {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(
          `${systemPrompt}\n\nStudent question: ${message}`
        );
        const response = result.response.text();
        return NextResponse.json({ response });
      } catch (e) {
        console.error("Gemini error:", e);
      }
    }

    // No API keys configured — return helpful mock response
    const mockResponses: Record<string, string> = {
      summarize: "**Summary:** To get AI summaries, add your OpenAI or Gemini API key to the `.env` file:\n\n```\nOPENAI_API_KEY=sk-...\n# or\nGEMINI_API_KEY=AIza...\n```\n\nThen restart the server.",
      explain: "**To enable AI explanations:** Add `OPENAI_API_KEY` or `GEMINI_API_KEY` to your `.env` file and restart the server.",
      quiz: "**Quiz generation** requires an AI API key. Add `OPENAI_API_KEY` or `GEMINI_API_KEY` to `.env` and restart.",
      proofread: "**Proofreading** requires an AI API key. Add `OPENAI_API_KEY` or `GEMINI_API_KEY` to `.env` and restart.",
    };

    const lowerMsg = message.toLowerCase();
    for (const [key, val] of Object.entries(mockResponses)) {
      if (lowerMsg.includes(key)) return NextResponse.json({ response: val });
    }

    return NextResponse.json({
      response: "**AI not configured.** Add your `OPENAI_API_KEY` or `GEMINI_API_KEY` to the `.env` file and restart `npm run dev` to enable the AI assistant.",
    });
  } catch (e) {
    console.error("AI chat error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}