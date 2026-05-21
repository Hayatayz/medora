"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { StudyMode } from "@/components/flashcards/StudyMode";
import type { Flashcard } from "@/types";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Brain, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function FlashcardsPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [bookTitle, setBookTitle] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [fcRes, bookRes] = await Promise.all([
          axios.get(`/api/ai/flashcards?bookId=${bookId}`),
          axios.get(`/api/books/${bookId}`),
        ]);
        setFlashcards(fcRes.data.flashcards ?? []);
        setBookTitle(bookRes.data.book?.title ?? "");
      } catch {
        // silently show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookId]);

  async function generateFlashcards() {
    setGenerating(true);
    try {
      const { data } = await axios.post("/api/ai/flashcards", { bookId, count: 15 });
      setFlashcards(data.flashcards ?? []);
      toast.success("Flashcards generated!");
    } catch {
      toast.error("Generation failed. Check your GEMINI_API_KEY.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/library"
          className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={15} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Flashcards</h1>
          {bookTitle && <p className="text-sm text-gray-500 mt-0.5">{bookTitle}</p>}
        </div>
        <button
          onClick={generateFlashcards}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F6E56] text-white rounded-xl text-sm font-medium hover:bg-[#085041] transition disabled:opacity-60"
        >
          <Sparkles size={14} />
          {generating ? "Generating..." : "Generate New"}
        </button>
      </div>

      {flashcards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-[#E8F5F0] rounded-2xl flex items-center justify-center mb-4">
            <Brain size={28} className="text-[#0F6E56]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No flashcards yet</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Generate AI-powered flashcards from your book content to start studying.
          </p>
          <button
            onClick={generateFlashcards}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0F6E56] text-white rounded-xl text-sm font-medium hover:bg-[#085041] transition disabled:opacity-60"
          >
            <Sparkles size={14} />
            {generating ? "Generating..." : "Generate Flashcards"}
          </button>
        </div>
      ) : (
        <StudyMode flashcards={flashcards} bookId={bookId} />
      )}
    </div>
  );
}
