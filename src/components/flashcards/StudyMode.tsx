"use client";

import { useState } from "react";
import { FlipCard } from "./FlipCard";
import { FlashcardProgress } from "./FlashcardProgress";
import type { Flashcard } from "@/types";
import { RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";

interface StudyModeProps {
  flashcards: Flashcard[];
  bookId: string;
}

export function StudyMode({ flashcards, bookId }: StudyModeProps) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);

  function handleResult(isCorrect: boolean) {
    if (isCorrect) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);

    setTimeout(() => {
      if (index + 1 >= flashcards.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
      }
    }, 600);
  }

  function restart() {
    setIndex(0);
    setCorrect(0);
    setWrong(0);
    setDone(false);
  }

  if (done) {
    const score = Math.round((correct / flashcards.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-[#E8F5F0] rounded-full flex items-center justify-center mb-6">
          <Trophy size={36} className="text-[#0F6E56]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h2>
        <p className="text-gray-500 mb-6">
          You scored <span className="font-semibold text-[#0F6E56]">{score}%</span> —{" "}
          {correct} correct, {wrong} incorrect
        </p>

        <div className="flex gap-3">
          <button
            onClick={restart}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0F6E56] text-white rounded-xl text-sm font-medium hover:bg-[#085041] transition"
          >
            <RotateCcw size={15} />
            Study Again
          </button>
          <Link
            href={`/quiz/${bookId}`}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
          >
            Take a Quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <FlashcardProgress
        current={index + 1}
        total={flashcards.length}
        correct={correct}
        wrong={wrong}
      />
      <FlipCard card={flashcards[index]} onResult={handleResult} />
    </div>
  );
}
