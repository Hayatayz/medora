"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import type { Book } from "@/types";
import { toast } from "sonner";

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchBooks = useCallback(async (search = "", category = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      const { data } = await axios.get(`/api/books?${params}`);
      setBooks(data.books);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBook = useCallback(async (bookId: string) => {
    try {
      await axios.delete(`/api/books/${bookId}`);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      setTotal((t) => t - 1);
      toast.success("Book deleted");
    } catch {
      toast.error("Failed to delete book");
    }
  }, []);

  return { books, loading, total, fetchBooks, deleteBook };
}
