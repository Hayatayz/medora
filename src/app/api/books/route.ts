import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";

    const where = {
      userId: payload.userId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { author: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(category && { category }),
    };

    const [books, total] = await Promise.all([
      db.book.findMany({
        where,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          readingProgress: {
            where: { userId: payload.userId },
            take: 1,
          },
        },
      }),
      db.book.count({ where }),
    ]);

    const formatted = books.map((b) => ({
      ...b,
      readingProgress: b.readingProgress[0] ?? null,
    }));

    return NextResponse.json({ books: formatted, total });
  } catch (error) {
    console.error("Books GET error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      title,
      author,
      description,
      fileUrl,
      fileKey,
      fileSize,
      category,
      pageCount,
      coverUrl,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const book = await db.book.create({
      data: {
        title,
        author: author ?? null,
        description: description ?? null,
        fileUrl: fileUrl ?? "",
        fileKey: fileKey ?? "",
        fileSize: fileSize ?? 0,
        category: category ?? null,
        pageCount: pageCount ?? 0,
        coverUrl: coverUrl ?? null,
        userId: payload.userId,
      },
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error("Books POST error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}