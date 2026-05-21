import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const progress = await db.readingProgress.findMany({
      where: { userId: payload.userId },
      include: { book: { select: { title: true, coverUrl: true } } },
      orderBy: { lastReadAt: "desc" },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Progress GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId, currentPage, totalPages, percentage, chapterId } = await request.json();

    const progress = await db.readingProgress.upsert({
      where: { userId_bookId: { userId: payload.userId, bookId } },
      update: { currentPage, totalPages, percentage, lastReadAt: new Date(), chapterId },
      create: { userId: payload.userId, bookId, currentPage, totalPages, percentage, chapterId },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Progress POST error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
