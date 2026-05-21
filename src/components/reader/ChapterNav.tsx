"use client";

import { useReaderStore } from "@/store/readerStore";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/types";
import { BookOpen } from "lucide-react";

interface ChapterNavProps {
  chapters: Chapter[];
  isDarkMode: boolean;
}

export function ChapterNav({ chapters, isDarkMode }: ChapterNavProps) {
  const { currentChapterId, setCurrentChapter } = useReaderStore();

  if (chapters.length === 0) {
    return (
      <div className={cn("p-4 text-center", isDarkMode ? "text-gray-500" : "text-gray-400")}>
        <BookOpen size={20} className="mx-auto mb-2 opacity-50" />
        <p className="text-xs">No chapters detected</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-wider px-4 py-2",
          isDarkMode ? "text-gray-500" : "text-gray-400"
        )}
      >
        Chapters
      </p>
      {chapters.map((chapter) => (
        <button
          key={chapter.id}
          onClick={() => setCurrentChapter(chapter.id)}
          className={cn(
            "w-full text-left px-4 py-2.5 text-sm transition",
            currentChapterId === chapter.id
              ? isDarkMode
                ? "bg-gray-700 text-white"
                : "bg-[#E8F5F0] text-[#0F6E56]"
              : isDarkMode
              ? "text-gray-400 hover:bg-gray-700 hover:text-white"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <span className="block truncate">{chapter.title}</span>
          <span
            className={cn(
              "text-xs mt-0.5",
              isDarkMode ? "text-gray-600" : "text-gray-400"
            )}
          >
            p. {chapter.pageStart}–{chapter.pageEnd}
          </span>
        </button>
      ))}
    </div>
  );
}
