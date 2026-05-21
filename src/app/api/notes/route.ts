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

    const notes = await db.note.findMany({
      where: { userId: payload.userId, ...(bookId ? { bookId } : {}) },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Notes GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId, content, pageNumber, chapterId } = await request.json();

    const note = await db.note.create({
      data: { userId: payload.userId, bookId, content, pageNumber, chapterId },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Notes POST error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, content } = await request.json();

    const note = await db.note.updateMany({
      where: { id, userId: payload.userId },
      data: { content },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Notes PATCH error:", error);
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

    await db.note.deleteMany({ where: { id, userId: payload.userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notes DELETE error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
