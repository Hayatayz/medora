"use client";

import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/types";
import { useReaderStore } from "@/store/readerStore";

interface ChapterNavProps {
  chapters: Chapter[];
  isDarkMode: boolean;
}

export function ChapterNav({ chapters, isDarkMode }: ChapterNavProps) {
  const { setCurrentChapter } = useReaderStore();

  function handleChapterClick(chapter: Chapter) {
    setCurrentChapter(chapter.id);
    // Dispatch a custom event that PDFViewer listens for
    window.dispatchEvent(
      new CustomEvent("medora:jump-to-page", { detail: { page: chapter.pageStart } })
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-3 text-center gap-2">
        <BookOpen size={20} className={isDarkMode ? "text-gray-600" : "text-gray-300"} />
        <p className={cn("text-xs", isDarkMode ? "text-gray-500" : "text-gray-400")}>
          No chapters detected
        </p>
      </div>
    );
  }

  return (
    <div className="py-1">
      {chapters.map((ch) => (
        <button
          key={ch.id}
          onClick={() => handleChapterClick(ch)}
          className={cn(
            "w-full text-left px-3 py-2 transition flex flex-col gap-0.5",
            isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
          )}
        >
          <span className={cn("text-xs font-medium leading-snug line-clamp-2",
            isDarkMode ? "text-gray-200" : "text-gray-700")}>
            {ch.title}
          </span>
          <span className={cn("text-[10px]", isDarkMode ? "text-gray-500" : "text-gray-400")}>
            Page {ch.pageStart}
          </span>
        </button>
      ))}
    </div>
  );
}