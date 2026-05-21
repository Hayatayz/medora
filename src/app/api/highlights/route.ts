import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    const highlights = await db.highlight.findMany({
      where: { userId: payload.userId, ...(bookId ? { bookId } : {}) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error("Highlights GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId, text, color, pageNumber, position, chapterId } = await request.json();

    const highlight = await db.highlight.create({
      data: {
        userId: payload.userId,
        bookId,
        text,
        color: color ?? "yellow",
        pageNumber,
        position: position ?? {},
        chapterId,
      },
    });

    return NextResponse.json({ highlight }, { status: 201 });
  } catch (error) {
    console.error("Highlights POST error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db.highlight.deleteMany({ where: { id, userId: payload.userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Highlights DELETE error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
