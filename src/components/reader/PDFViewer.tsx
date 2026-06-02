"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useReaderStore } from "@/store/readerStore";
import { ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  fileUrl: string;
  bookId: string;
  onPageChange: (page: number, total: number) => void;
  onTextSelect: (text: string, x: number, y: number) => void;
}

interface PageState {
  rendered: boolean;
  rendering: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderTask: any;
}

export function PDFViewer({ fileUrl, onPageChange, onTextSelect }: PDFViewerProps) {
  const { isDarkMode } = useReaderStore();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdf, setPdf] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const textLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pageStates = useRef<PageState[]>([]);
  const scaleRef = useRef(scale);
  const pdfRef = useRef(pdf);
  const totalPagesRef = useRef(totalPages);
  const onPageChangeRef = useRef(onPageChange);

  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { pdfRef.current = pdf; }, [pdf]);
  useEffect(() => { totalPagesRef.current = totalPages; }, [totalPages]);
  useEffect(() => { onPageChangeRef.current = onPageChange; }, [onPageChange]);

  function resolveUrl(url: string): string {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${window.location.origin}${url}`;
    return url;
  }

  useEffect(() => {
    if (!fileUrl) {
      setError("No PDF file specified.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPDF() {
      try {
        setLoading(true);
        setError(null);
        setPdf(null);
        setTotalPages(0);

        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const resolved = resolveUrl(fileUrl);
        const doc = await pdfjsLib.getDocument({ url: resolved }).promise;

        if (cancelled) return;

        canvasRefs.current = new Array(doc.numPages).fill(null);
        textLayerRefs.current = new Array(doc.numPages).fill(null);
        pageStates.current = new Array(doc.numPages).fill(null).map(() => ({
          rendered: false,
          rendering: false,
          renderTask: null,
        }));

        setPdf(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        onPageChange(1, doc.numPages);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          console.error("PDF load failed:", e);
          setError("Failed to load PDF. The file may be missing or inaccessible.");
          setLoading(false);
        }
      }
    }

    loadPDF();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);

  const renderPage = useCallback(async (pageNum: number) => {
    const doc = pdfRef.current;
    if (!doc) return;

    const state = pageStates.current[pageNum - 1];
    if (!state) return;

    const canvas = canvasRefs.current[pageNum - 1];
    if (!canvas) return;

    if (state.rendering && state.renderTask) {
      try { await state.renderTask.cancel(); } catch {}
      state.rendering = false;
      state.renderTask = null;
    }

    state.rendered = false;
    state.rendering = true;

    try {
      const page = await doc.getPage(pageNum);
      const currentScale = scaleRef.current;
      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: currentScale * dpr });
      const cssViewport = page.getViewport({ scale: currentScale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${cssViewport.width}px`;
      canvas.style.height = `${cssViewport.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const renderTask = page.render({ canvasContext: ctx, viewport });
      state.renderTask = renderTask;
      await renderTask.promise;
      state.rendered = true;

      // Build selectable text layer
      const textDiv = textLayerRefs.current[pageNum - 1];
      if (textDiv) {
        textDiv.innerHTML = "";
        textDiv.style.width = `${cssViewport.width}px`;
        textDiv.style.height = `${cssViewport.height}px`;

        const textContent = await page.getTextContent();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        textContent.items.forEach((item: any) => {
          if (!item.str) return;
          const span = document.createElement("span");
          span.textContent = item.str + (item.hasEOL ? "\n" : " ");

          const tx = item.transform;
          const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
          const x = tx[4] * currentScale;
          const y = cssViewport.height - tx[5] * currentScale;

          span.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y - fontHeight * currentScale}px;
            font-size: ${fontHeight * currentScale}px;
            font-family: sans-serif;
            transform-origin: 0% 0%;
            white-space: pre;
            color: transparent;
            cursor: text;
            user-select: text;
            -webkit-user-select: text;
          `;
          textDiv.appendChild(span);
        });
      }
    } catch (e: unknown) {
      if ((e as { name?: string })?.name !== "RenderingCancelledException") {
        console.error(`Page ${pageNum} render error:`, e);
      }
    } finally {
      state.rendering = false;
      state.renderTask = null;
    }
  }, []);

  const rescaleAll = useCallback(async () => {
    if (!pdfRef.current) return;
    for (const state of pageStates.current) {
      if (state?.rendering && state.renderTask) {
        try { await state.renderTask.cancel(); } catch {}
        state.rendering = false;
        state.renderTask = null;
        state.rendered = false;
      }
    }
    for (let i = 0; i < canvasRefs.current.length; i++) {
      if (canvasRefs.current[i]) renderPage(i + 1);
    }
  }, [renderPage]);

  useEffect(() => {
    if (pdf && !loading) rescaleAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  // Lazy render via IntersectionObserver
  useEffect(() => {
    if (!pdf || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNum = Number((entry.target as HTMLElement).dataset.page);
          if (!pageNum) return;
          if (entry.isIntersecting) {
            const state = pageStates.current[pageNum - 1];
            if (state && !state.rendered && !state.rendering) renderPage(pageNum);
            if (entry.intersectionRatio > 0.3) {
              setCurrentPage(pageNum);
              onPageChange(pageNum, totalPages);
            }
          }
        });
      },
      { root: containerRef.current, threshold: [0.1, 0.3, 0.6] }
    );

    containerRef.current?.querySelectorAll("[data-page]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf, loading, totalPages]);

  // Chapter/bookmark jump
  useEffect(() => {
    function handleJump(e: Event) {
      const page = (e as CustomEvent).detail?.page;
      const total = totalPagesRef.current;
      if (page && page >= 1 && page <= total) {
        setCurrentPage(page);
        onPageChangeRef.current(page, total);
        setTimeout(() => {
          containerRef.current
            ?.querySelector(`[data-page="${page}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    }
    window.addEventListener("medora:jump-to-page", handleJump);
    return () => window.removeEventListener("medora:jump-to-page", handleJump);
  }, []);

  function scrollToPage(pageNum: number) {
    containerRef.current
      ?.querySelector(`[data-page="${pageNum}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Text selection from the transparent text layer
  function handleMouseUp() {
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (text && text.length > 1) {
      const rect = sel!.getRangeAt(0).getBoundingClientRect();
      onTextSelect(text, rect.left + rect.width / 2, rect.top);
    }
  }

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden", isDarkMode ? "bg-gray-800" : "bg-gray-100")}>
      {/* Toolbar */}
      <div className={cn(
        "flex items-center justify-center gap-2 py-2 px-4 border-b flex-shrink-0 text-sm",
        isDarkMode ? "bg-gray-900 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-700"
      )}>
        <button onClick={() => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(1)))}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ZoomOut size={15} />
        </button>
        <span className="text-xs w-14 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale((s) => Math.min(4, +(s + 0.2).toFixed(1)))}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <ZoomIn size={15} />
        </button>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-2" />

        <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[110px] text-center">
          {loading ? "Loading…" : `Page ${currentPage} of ${totalPages}`}
        </span>

        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-2" />

        {/* Page jump — only fires on Enter or blur, not every keystroke */}
        <input
          type="number"
          min={1}
          max={totalPages || 1}
          defaultValue={1}
          key={`page-input-${totalPages}`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const p = Math.max(1, Math.min(totalPages, Number((e.target as HTMLInputElement).value)));
              setCurrentPage(p);
              scrollToPage(p);
              onPageChange(p, totalPages);
            }
          }}
          onBlur={(e) => {
            const p = Math.max(1, Math.min(totalPages, Number(e.target.value)));
            if (p !== currentPage) {
              setCurrentPage(p);
              scrollToPage(p);
              onPageChange(p, totalPages);
            }
          }}
          className={cn(
            "w-14 text-center border rounded px-2 py-1 text-xs outline-none focus:border-[#0F6E56]",
            isDarkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-gray-50 border-gray-300"
          )}
        />
      </div>

      {/* Scrollable pages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto" onMouseUp={handleMouseUp}>
        {error ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
            <p className="text-red-500 text-sm">{error}</p>
            <p className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              Try re-uploading the PDF from the library.
            </p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
            <p className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>Loading PDF…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 gap-6 px-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <div key={pageNum} data-page={pageNum} className="relative flex-shrink-0">
                <div
                  className={cn("shadow-xl rounded overflow-hidden bg-white", isDarkMode && "shadow-gray-900")}
                  style={{ filter: isDarkMode ? "invert(0.85) hue-rotate(180deg)" : "none" }}
                >
                  {/* Canvas layer */}
                  <canvas
                    ref={(el) => { canvasRefs.current[pageNum - 1] = el; }}
                    style={{ display: "block", minWidth: "400px", minHeight: "560px" }}
                  />
                  {/* Transparent text layer for selection */}
                  <div
                    ref={(el) => { textLayerRefs.current[pageNum - 1] = el; }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      overflow: "hidden",
                      pointerEvents: "auto",
                      userSelect: "text",
                    }}
                  />
                </div>
                <div className="absolute bottom-2 right-3 bg-black/25 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                  {pageNum}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}