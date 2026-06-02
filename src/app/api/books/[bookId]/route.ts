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
      include: { chapters: { orderBy: { orderIndex: "asc" } } },
    });

    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    // Resolve fileUrl — if it's a fileKey (no slash prefix), build the local path
    let fileUrl = book.fileUrl;
    if (fileUrl && !fileUrl.startsWith("http") && !fileUrl.startsWith("/")) {
      fileUrl = `/uploads/${book.fileKey}`;
    }
    // If fileUrl is empty but fileKey exists, build from fileKey
    if (!fileUrl && book.fileKey) {
      fileUrl = `/uploads/${book.fileKey}`;
    }

    return NextResponse.json({ book: { ...book, fileUrl } });
  } catch (e) {
    console.error("Book GET error:", e);
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

    await db.book.deleteMany({ where: { id: bookId, userId: payload.userId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Book DELETE error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}