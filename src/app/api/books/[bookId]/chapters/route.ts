import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth/jwt";
import path from "path";
import fs from "fs";

interface Chapter {
  title: string;
  content: string;
  pageStart: number;
  pageEnd: number;
}

function detectChapters(text: string, totalPages: number): Chapter[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const chapters: Chapter[] = [];

  const patterns = [
    /^chapter\s+\d+/i,
    /^part\s+[ivxlcdm\d]+/i,
    /^section\s+\d+/i,
    /^\d+\.\s+[A-Z].{3,60}$/,
    /^[A-Z][A-Z\s]{5,50}$/,
  ];

  let current: Chapter | null = null;
  let buf: string[] = [];
  const lpp = Math.max(1, Math.ceil(lines.length / (totalPages || 1)));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const pg = Math.min(totalPages, Math.ceil((i + 1) / lpp));
    const isHeading = line.length > 3 && line.length < 100 && patterns.some((p) => p.test(line));

    if (isHeading) {
      if (current) {
        current.content = buf.join(" ").trim();
        current.pageEnd = Math.max(pg - 1, current.pageStart);
        if (current.content.length > 20 || buf.length > 2) chapters.push(current);
      }
      current = { title: line, content: "", pageStart: pg, pageEnd: totalPages };
      buf = [];
    } else if (current) {
      buf.push(line);
    }
  }

  if (current) {
    current.content = buf.join(" ").trim();
    current.pageEnd = totalPages;
    chapters.push(current);
  }

  // Fallback: chunk by pages if nothing found
  if (chapters.length < 2 && totalPages > 0) {
    chapters.length = 0;
    const size = Math.max(15, Math.ceil(totalPages / 12));
    for (let s = 1; s <= totalPages; s += size) {
      const e = Math.min(s + size - 1, totalPages);
      chapters.push({ title: `Pages ${s}–${e}`, content: "", pageStart: s, pageEnd: e });
    }
  }

  return chapters;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId } = await params;

    const existing = await db.chapter.findMany({
      where: { bookId },
      orderBy: { orderIndex: "asc" },
    });
    if (existing.length > 0) return NextResponse.json({ chapters: existing });

    const book = await db.book.findFirst({ where: { id: bookId, userId: payload.userId } });
    if (!book) return NextResponse.json({ chapters: [] });

    // Find the file
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const candidates = [
      path.join(uploadsDir, book.fileKey),
      path.join(uploadsDir, `${book.fileKey}.pdf`),
    ];

    const localPath = candidates.find((p) => fs.existsSync(p));
    if (!localPath) return NextResponse.json({ chapters: [] });

    const buffer = fs.readFileSync(localPath);
    let text = "";
    let pageCount = book.pageCount || 1;

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PDFParse } = require("pdf-parse");
      const r = await new PDFParse().parse(buffer);
      text = r.text || "";
      pageCount = r.numpages || pageCount;
    } catch {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const r = await require("pdf-parse")(buffer);
        text = r.text || "";
        pageCount = r.numpages || pageCount;
      } catch (e) {
        console.error("pdf-parse failed:", e);
        return NextResponse.json({ chapters: [] });
      }
    }

    const detected = detectChapters(text, pageCount);

    const saved = await Promise.all(
      detected.map((ch, idx) =>
        db.chapter.create({
          data: {
            bookId,
            title: ch.title,
            content: ch.content.slice(0, 5000),
            orderIndex: idx,
            pageStart: ch.pageStart,
            pageEnd: ch.pageEnd,
          },
        })
      )
    );

    return NextResponse.json({ chapters: saved });
  } catch (e) {
    console.error("Chapters error:", e);
    return NextResponse.json({ chapters: [] });
  }
}