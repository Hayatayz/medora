"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import type { Book } from "@/types";
import { toast } from "sonner";

export function useReader(bookId: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBook = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/books/${bookId}`);
      setBook(data.book);
    } catch {
      toast.error("Failed to load book");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  const updateProgress = useCallback(
    async (currentPage: number, totalPages: number) => {
      try {
        await axios.post("/api/progress", {
          bookId,
          currentPage,
          totalPages,
          percentage: Math.round((currentPage / totalPages) * 100),
        });
      } catch {
        // silent
      }
    },
    [bookId]
  );

  return { book, loading, fetchBook, updateProgress };
}
