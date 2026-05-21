"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useReader } from "@/hooks/useReader";
import { useReaderStore } from "@/store/readerStore";
import { PDFViewer } from "@/components/reader/PDFViewer";
import { ReaderToolbar } from "@/components/reader/ReaderToolbar";
import { ChapterNav } from "@/components/reader/ChapterNav";
import { AIPanel } from "@/components/ai/AIPanel";
import { NotesPanel } from "@/components/reader/NotesPanel";
import { BookmarkPanel } from "@/components/reader/BookmarkPanel";
import { HighlightMenu } from "@/components/reader/HighlightMenu";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const { book, loading, fetchBook, updateProgress } = useReader(bookId);
  const { isDarkMode, isAIPanelOpen, isFocusMode, setSelectedText, currentChapterId } =
    useReaderStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [highlight, setHighlight] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const handlePageChange = useCallback(
    (page: number, total: number) => {
      setCurrentPage(page);
      setTotalPages(total);
      updateProgress(page, total);
    },
    [updateProgress]
  );

  const handleTextSelect = useCallback(
    (text: string, x: number, y: number) => {
      setHighlight({ text, x, y });
      setSelectedText(text);
    },
    [setSelectedText]
  );

  async function handleHighlight(color: string) {
    if (!highlight) return;
    try {
      await axios.post("/api/highlights", {
        bookId,
        text: highlight.text,
        color,
        pageNumber: currentPage,
        chapterId: currentChapterId,
      });
      toast.success("Highlight saved");
    } catch {
      toast.error("Failed to save highlight");
    }
    setHighlight(null);
  }

  async function handleBookmarkPage() {
    try {
      await axios.post("/api/bookmarks", {
        bookId,
        pageNumber: currentPage,
        label: `Page ${currentPage}`,
        chapterId: currentChapterId,
      });
      toast.success(`Page ${currentPage} bookmarked`);
    } catch {
      toast.error("Failed to bookmark page");
    }
  }

  if (loading) return <PageLoader />;
  if (!book) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Book not found</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen overflow-hidden",
        isDarkMode ? "bg-gray-900" : "bg-white"
      )}
    >
      {/* Toolbar */}
      {!isFocusMode && (
        <ReaderToolbar
          bookTitle={book.title}
          bookId={bookId}
          currentPage={currentPage}
          totalPages={totalPages}
          onBookmarkPage={handleBookmarkPage}
          onToggleNotes={() => setNotesOpen(!notesOpen)}
          notesOpen={notesOpen}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — chapters & bookmarks */}
        {!isFocusMode && (
          <div
            className={cn(
              "w-56 border-r flex-shrink-0 overflow-y-auto",
              isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"
            )}
          >
            <Tabs defaultValue="chapters">
              <TabsList className="w-full rounded-none border-b border-gray-100 dark:border-gray-700 bg-transparent h-10 px-2">
                <TabsTrigger value="chapters" className="flex-1 text-xs">
                  Chapters
                </TabsTrigger>
                <TabsTrigger value="bookmarks" className="flex-1 text-xs">
                  Bookmarks
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chapters" className="mt-0">
                <ChapterNav chapters={book.chapters ?? []} isDarkMode={isDarkMode} />
              </TabsContent>
              <TabsContent value="bookmarks" className="mt-0">
                <BookmarkPanel
                  bookId={bookId}
                  isDarkMode={isDarkMode}
                  onJumpToPage={(page) => handlePageChange(page, totalPages)}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* PDF viewer */}
        <PDFViewer
          fileUrl={book.fileUrl}
          bookId={bookId}
          onPageChange={handlePageChange}
          onTextSelect={handleTextSelect}
        />

        {/* Right panels */}
        {isAIPanelOpen && !isFocusMode && (
          <AIPanel
            bookId={bookId}
            chapterId={currentChapterId ?? undefined}
            isDarkMode={isDarkMode}
          />
        )}
        {notesOpen && !isFocusMode && (
          <NotesPanel
            bookId={bookId}
            currentPage={currentPage}
            isDarkMode={isDarkMode}
            onClose={() => setNotesOpen(false)}
          />
        )}
      </div>

      {/* Highlight context menu */}
      {highlight && (
        <HighlightMenu
          x={highlight.x}
          y={highlight.y}
          onHighlight={handleHighlight}
          onAskAI={() => {
            setHighlight(null);
            useReaderStore.getState().toggleAIPanel();
          }}
          onClose={() => setHighlight(null)}
        />
      )}
    </div>
  );
}
