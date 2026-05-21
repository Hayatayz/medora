"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface BookmarkItem {
  id: string;
  pageNumber: number;
  label?: string;
  createdAt: string;
}

interface BookmarkPanelProps {
  bookId: string;
  isDarkMode: boolean;
  onJumpToPage: (page: number) => void;
}

export function BookmarkPanel({ bookId, isDarkMode, onJumpToPage }: BookmarkPanelProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    axios
      .get(`/api/bookmarks?bookId=${bookId}`)
      .then((r) => setBookmarks(r.data.bookmarks))
      .catch(() => {});
  }, [bookId]);

  async function deleteBookmark(id: string) {
    try {
      await axios.delete(`/api/bookmarks?id=${id}`);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error("Failed to delete bookmark");
    }
  }

  if (bookmarks.length === 0) {
    return (
      <div className={cn("p-4 text-center", isDarkMode ? "text-gray-500" : "text-gray-400")}>
        <Bookmark size={20} className="mx-auto mb-2 opacity-50" />
        <p className="text-xs">No bookmarks yet</p>
        <p className="text-xs mt-1">Click the bookmark icon in the toolbar to save a page</p>
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
        Bookmarks
      </p>
      {bookmarks.map((bm) => (
        <div
          key={bm.id}
          className={cn(
            "flex items-center justify-between px-4 py-2.5 group cursor-pointer transition",
            isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
          )}
          onClick={() => onJumpToPage(bm.pageNumber)}
        >
          <div className="flex items-center gap-2">
            <Bookmark size={13} className="text-[#0F6E56]" />
            <div>
              <p className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-gray-700")}>
                {bm.label ?? `Page ${bm.pageNumber}`}
              </p>
              <p className={cn("text-xs", isDarkMode ? "text-gray-600" : "text-gray-400")}>
                Page {bm.pageNumber}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteBookmark(bm.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
