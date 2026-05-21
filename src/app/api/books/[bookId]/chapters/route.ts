import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId } = await params;

    const book = await db.book.findFirst({
      where: { id: bookId, userId: payload.userId },
    });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const chapters = await db.chapter.findMany({
      where: { bookId },
      orderBy: { orderIndex: "asc" },
      select: {
        id: true,
        title: true,
        orderIndex: true,
        pageStart: true,
        pageEnd: true,
        bookId: true,
      },
    });

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error("Chapters GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
