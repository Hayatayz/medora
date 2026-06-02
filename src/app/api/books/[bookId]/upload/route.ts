import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth/jwt";
import path from "path";
import fs from "fs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId } = await params;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const fileKey = `${bookId}-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileKey);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${fileKey}`;

    // Get page count
    let pageCount = 0;
    try {
      const { PDFParse } = require("pdf-parse");
      const parser = new PDFParse();
      const result = await parser.parse(buffer);
      pageCount = result.numpages || 0;
    } catch {
      try {
        const pdfParse = require("pdf-parse");
        const result = await pdfParse(buffer);
        pageCount = result.numpages || 0;
      } catch { pageCount = 0; }
    }

    // Update book record
    const book = await db.book.update({
      where: { id: bookId },
      data: {
        fileUrl,
        fileKey,
        fileSize: file.size,
        pageCount,
        isProcessed: true,
      },
    });

    return NextResponse.json({ book, fileUrl });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}