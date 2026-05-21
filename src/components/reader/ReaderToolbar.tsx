"use client";

import { useReaderStore } from "@/store/readerStore";
import {
  ChevronLeft,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MessageSquare,
  Timer,
  Bookmark,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ReaderToolbarProps {
  bookTitle: string;
  bookId: string;
  currentPage: number;
  totalPages: number;
  onBookmarkPage: () => void;
  onToggleNotes: () => void;
  notesOpen: boolean;
}

export function ReaderToolbar({
  bookTitle,
  bookId: _bookId,
  currentPage,
  totalPages,
  onBookmarkPage,
  onToggleNotes,
  notesOpen,
}: ReaderToolbarProps) {
  const {
    fontSize,
    isDarkMode,
    isFocusMode,
    isAIPanelOpen,
    setFontSize,
    toggleDarkMode,
    toggleFocusMode,
    toggleAIPanel,
    togglePomodoro,
  } = useReaderStore();

  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <div
      className={cn(
        "h-12 flex items-center justify-between px-4 border-b transition-colors",
        isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <Link
          href="/library"
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium transition",
            isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
          )}
        >
          <ChevronLeft size={16} />
          Library
        </Link>
        <span className={cn("text-sm truncate max-w-48", isDarkMode ? "text-gray-200" : "text-gray-700")}>
          {bookTitle}
        </span>
      </div>

      {/* Center — progress */}
      <div className="hidden sm:flex items-center gap-3">
        <span className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-400")}>
          {currentPage} / {totalPages}
        </span>
        <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0F6E56] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={cn("text-xs", isDarkMode ? "text-gray-400" : "text-gray-400")}>
          {progress}%
        </span>
      </div>

      {/* Right — tools */}
      <div className="flex items-center gap-1">
        <ToolBtn
          onClick={() => setFontSize(Math.max(12, fontSize - 2))}
          dark={isDarkMode}
          title="Decrease font"
        >
          <ZoomOut size={15} />
        </ToolBtn>
        <ToolBtn
          onClick={() => setFontSize(Math.min(24, fontSize + 2))}
          dark={isDarkMode}
          title="Increase font"
        >
          <ZoomIn size={15} />
        </ToolBtn>
        <ToolBtn onClick={toggleDarkMode} dark={isDarkMode} title="Toggle dark mode">
          {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
        </ToolBtn>
        <ToolBtn onClick={onBookmarkPage} dark={isDarkMode} title="Bookmark page">
          <Bookmark size={15} />
        </ToolBtn>
        <ToolBtn
          onClick={onToggleNotes}
          dark={isDarkMode}
          active={notesOpen}
          title="Notes"
        >
          <StickyNote size={15} />
        </ToolBtn>
        <ToolBtn onClick={togglePomodoro} dark={isDarkMode} title="Pomodoro timer">
          <Timer size={15} />
        </ToolBtn>
        <ToolBtn
          onClick={toggleAIPanel}
          dark={isDarkMode}
          active={isAIPanelOpen}
          title="AI Assistant"
        >
          <MessageSquare size={15} />
        </ToolBtn>
        <ToolBtn onClick={toggleFocusMode} dark={isDarkMode} active={isFocusMode} title="Focus mode">
          <Maximize2 size={15} />
        </ToolBtn>
      </div>
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  dark,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  dark: boolean;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center transition",
        active
          ? "bg-[#0F6E56] text-white"
          : dark
          ? "text-gray-400 hover:bg-gray-700 hover:text-white"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      {children}
    </button>
  );
}
