"use client";

import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import type { Book } from "@/types";

interface RecentBooksProps {
  books: Book[];
}

export function RecentBooks({ books }: RecentBooksProps) {
  if (books.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Books</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
            <BookOpen size={20} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No books yet</p>
          <Link
            href="/library"
            className="mt-3 text-sm text-[#0F6E56] font-medium hover:underline"
          >
            Upload your first book →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Recent Books</h3>
        <Link
          href="/library"
          className="text-xs text-[#0F6E56] font-medium flex items-center gap-1 hover:underline"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>
      <div className="space-y-3">
        {books.slice(0, 4).map((book) => (
          <Link
            key={book.id}
            href={`/reader/${book.id}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group"
          >
            <div className="w-10 h-12 bg-gradient-to-br from-[#0F6E56] to-[#378ADD] rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {truncate(book.title, 30)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {book.author ?? "Unknown author"} · {formatDate(book.createdAt)}
              </p>
              {book.readingProgress && (
                <div className="mt-1.5 bg-gray-100 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-[#0F6E56] rounded-full"
                    style={{ width: `${book.readingProgress.percentage}%` }}
                  />
                </div>
              )}
            </div>
            <ArrowRight
              size={14}
              className="text-gray-300 group-hover:text-[#0F6E56] transition flex-shrink-0"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
