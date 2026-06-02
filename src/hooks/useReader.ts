"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import type { Book } from "@/types";

export function useReader(bookId: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBook = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/books/${bookId}`);
      const bookData: Book = data.book;

      // Fetch chapters separately and attach
      try {
        const chapRes = await axios.get(`/api/books/${bookId}/chapters`);
        bookData.chapters = chapRes.data.chapters ?? [];
      } catch {
        bookData.chapters = [];
      }

      setBook(bookData);
    } catch (e) {
      console.error("Failed to fetch book:", e);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  const updateProgress = useCallback(async (currentPage: number, totalPages: number) => {
    if (!currentPage || !totalPages) return;
    try {
      await axios.post("/api/progress", {
        bookId,
        currentPage,
        totalPages,
        percentage: Math.round((currentPage / totalPages) * 100),
      });
    } catch {
      // Silent fail — progress is non-critical
    }
  }, [bookId]);

  return { book, loading, fetchBook, updateProgress };
}