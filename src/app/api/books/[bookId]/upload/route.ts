import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { uploadToS3 } from "@/lib/aws/s3";
import { extractPDFText } from "@/lib/pdf/extractor";
import { detectChapters } from "@/lib/pdf/chapterDetector";
import { v4 as uuidv4 } from "uuid";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const token = request.cookies.get("medora-token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookId } = await params;

    const book = await db.book.findFirst({
      where: { id: bookId, userId: payload.userId },
    });
    if (!book)
      return NextResponse.json({ error: "Book not found" }, { status: 404 });

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Failed to parse form data" },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;
    if (!file)
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 50MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filename = `${uuidv4()}.pdf`;
    const key = `books/${payload.userId}/${filename}`;
    let fileUrl = "";

    // Decide storage: S3 or local
    const awsKey = process.env.AWS_ACCESS_KEY_ID;
    const s3Configured =
      awsKey && awsKey !== "placeholder" && awsKey.length > 5;

    if (s3Configured) {
      try {
        fileUrl = await uploadToS3(buffer, key, "application/pdf");
      } catch (s3Error) {
        console.error("S3 upload failed:", s3Error);
        return NextResponse.json(
          { error: "File storage failed" },
          { status: 500 }
        );
      }
    } else {
      // Development: save locally to public/uploads
      try {
        await mkdir(UPLOADS_DIR, { recursive: true });
        await writeFile(path.join(UPLOADS_DIR, filename), buffer);
        fileUrl = `/uploads/${filename}`;
      } catch (fsError) {
        console.error("Local file save failed:", fsError);
        return NextResponse.json(
          { error: "File save failed" },
          { status: 500 }
        );
      }
    }

    // Extract text and detect chapters — never crash upload if this fails
    let pageCount = 0;
    let chapters: ReturnType<typeof detectChapters> = [];

    try {
      const extracted = await extractPDFText(buffer);
      pageCount = extracted.pageCount;

      if (extracted.text && extracted.text.length > 100) {
        chapters = detectChapters(extracted.text);
      }
    } catch (extractError) {
      console.warn(
        "PDF extraction failed — upload continues without chapters:",
        extractError
      );
    }

    // Update book record with file info
    const updated = await db.book.update({
      where: { id: bookId },
      data: {
        fileUrl,
        fileKey: key,
        fileSize: file.size,
        pageCount,
        isProcessed: true,
      },
    });

    // Save detected chapters
    if (chapters.length > 0) {
      await db.chapter.deleteMany({ where: { bookId } });
      await db.chapter.createMany({
        data: chapters.map((c) => ({
          bookId,
          title: c.title,
          content: c.content,
          orderIndex: c.orderIndex,
          pageStart: c.pageStart,
          pageEnd: c.pageEnd,
        })),
      });
    }

    return NextResponse.json({
      book: updated,
      chaptersDetected: chapters.length,
      fileUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}