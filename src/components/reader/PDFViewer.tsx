"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useReaderStore } from "@/store/readerStore";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PDFViewerProps {
  fileUrl: string;
  bookId: string;
  onPageChange: (page: number, total: number) => void;
  onTextSelect: (text: string, x: number, y: number) => void;
}

export function PDFViewer({ fileUrl, onPageChange, onTextSelect }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTaskRef = useRef<any>(null);
  const isRenderingRef = useRef(false);
  const pendingPageRef = useRef<number | null>(null);
  const [noPdf, setNoPdf] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [rendering, setRendering] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  const { isDarkMode } = useReaderStore();

  useEffect(() => {
    let cancelled = false;

    async function loadPDF() {
  if (!fileUrl) return;

  // Check if URL is actually a PDF (not an image from Open Library import)
  const isValidPDF =
    fileUrl.startsWith("/uploads/") ||
    fileUrl.startsWith("https://") && fileUrl.includes(".pdf") ||
    fileUrl.startsWith("blob:");

  const looksLikeImage =
    fileUrl.includes("covers.openlibrary.org") ||
    fileUrl.endsWith(".jpg") ||
    fileUrl.endsWith(".jpeg") ||
    fileUrl.endsWith(".png");

  if (looksLikeImage || (!isValidPDF && !fileUrl.startsWith("/uploads/"))) {
    setLoadError(true);
    setNoPdf(true);
    return;
  }

  setLoadError(false);
  setPdfReady(false);

      try {
        const pdfjsLib = await import("pdfjs-dist");

        // Use CDN worker — most reliable across Next.js versions
        pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs";

        const loadingTask = pdfjsLib.getDocument({
  url: fileUrl,
  cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/cmaps/",
  cMapPacked: true,
});

        const doc = await loadingTask.promise;
        if (cancelled) return;

        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        onPageChange(1, doc.numPages);
        setPdfReady(true);
      } catch (err) {
        console.error("PDF load error:", err);
        if (!cancelled) setLoadError(true);
      }
    }

    loadPDF();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);

  const renderPage = useCallback(
    async (pageNum: number) => {
      if (!pdfDocRef.current || !canvasRef.current) return;

      if (isRenderingRef.current) {
        pendingPageRef.current = pageNum;
        return;
      }

      isRenderingRef.current = true;
      setRendering(true);

      try {
        if (renderTaskRef.current) {
          try { renderTaskRef.current.cancel(); } catch { /* ignore */ }
          renderTaskRef.current = null;
        }

        const page = await pdfDocRef.current.getPage(pageNum);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const container = containerRef.current;
        const containerWidth = (container?.clientWidth ?? 800) - 48;
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(containerWidth / viewport.width, 1.8);
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // White background first
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (isDarkMode) {
          ctx.filter = "invert(0.9) hue-rotate(180deg)";
        } else {
          ctx.filter = "none";
        }

        const task = page.render({
          canvasContext: ctx,
          viewport: scaledViewport,
          background: "white",
        });

        renderTaskRef.current = task;
        await task.promise;
        renderTaskRef.current = null;
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "RenderingCancelledException") {
          console.error("Render error:", err);
        }
      } finally {
        isRenderingRef.current = false;
        setRendering(false);

        if (pendingPageRef.current !== null) {
          const nextPage = pendingPageRef.current;
          pendingPageRef.current = null;
          renderPage(nextPage);
        }
      }
    },
    [isDarkMode]
  );

  useEffect(() => {
    if (pdfReady) {
      renderPage(currentPage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pdfReady, isDarkMode]);

  function handleMouseUp() {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 3) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      if (rect) {
        onTextSelect(text, rect.left + rect.width / 2, rect.top);
      }
    }
  }

  function goTo(page: number) {
    const p = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(p);
    onPageChange(p, totalPages);
  }

  if (loadError) {
  return (
    <div className={cn("flex-1 flex items-center justify-center", isDarkMode ? "bg-gray-800" : "bg-gray-100")}>
      <div className="text-center max-w-sm px-6">
        {noPdf ? (
          <>
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-2">
              No PDF file attached
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              This book was imported from Open Library and only has metadata. 
              To read it, delete this book and upload the actual PDF file from your device.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium mb-2 text-gray-700">Could not load PDF</p>
            <p className="text-xs text-gray-400">The file may have been moved or the URL is invalid.</p>
          </>
        )}
      </div>
    </div>
  );
}

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 flex flex-col items-center overflow-y-auto",
        isDarkMode ? "bg-gray-800" : "bg-[#F5F5F0]"
      )}
      onMouseUp={handleMouseUp}
    >
      {!pdfReady && !loadError && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading PDF...</p>
        </div>
      )}

      {pdfReady && (
        <div className="relative my-8 shadow-2xl rounded-lg overflow-hidden">
          {rendering && (
            <div className={cn(
              "absolute inset-0 flex items-center justify-center z-10",
              isDarkMode ? "bg-gray-900/40" : "bg-white/40"
            )}>
              <div className="w-8 h-8 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <canvas ref={canvasRef} className="block max-w-full" />
        </div>
      )}

      {totalPages > 0 && (
        <div className={cn(
          "sticky bottom-4 flex items-center gap-3 px-4 py-2 rounded-2xl shadow-lg border mb-6",
          isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"
        )}>
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage <= 1}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-30",
              isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={cn("text-sm font-medium tabular-nums min-w-[70px] text-center", isDarkMode ? "text-gray-200" : "text-gray-700")}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-30",
              isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}


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

// hayat@hayat-HP-EliteBook-830-G8-Notebook-PC:~/medora$ and for the usability issue i want the user to upload book in manually offline and for the premuim one the user can load 10books and can have more than 50 chats with ai it can be around 350 and make the rest as it is