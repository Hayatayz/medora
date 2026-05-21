import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth/jwt";

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
      include: {
        chapters: { orderBy: { orderIndex: "asc" } },
        readingProgress: { where: { userId: payload.userId }, take: 1 },
      },
    });

    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    return NextResponse.json({
      book: { ...book, readingProgress: book.readingProgress[0] ?? null },
    });
  } catch (error) {
    console.error("Book GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
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

    await db.book.delete({ where: { id: bookId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Book DELETE error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId } = await params;
    const body = await request.json();

    const book = await db.book.findFirst({
      where: { id: bookId, userId: payload.userId },
    });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const updated = await db.book.update({
      where: { id: bookId },
      data: {
        title: body.title ?? book.title,
        author: body.author ?? book.author,
        description: body.description ?? book.description,
        category: body.category ?? book.category,
      },
    });

    return NextResponse.json({ book: updated });
  } catch (error) {
    console.error("Book PATCH error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
