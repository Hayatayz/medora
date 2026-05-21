"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/types";

interface FlipCardProps {
  card: Flashcard;
  onResult: (correct: boolean) => void;
}

const DIFFICULTY_COLORS = {
  EASY: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HARD: "bg-red-100 text-red-700",
};

export function FlipCard({ card, onResult }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);

  function handleResult(correct: boolean) {
    setAnswered(true);
    onResult(correct);
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl mx-auto">
      {/* Card */}
      <div
        className="w-full cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => !answered && setFlipped(!flipped)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "220px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-2xl border border-gray-100 shadow-md flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full mb-4",
                DIFFICULTY_COLORS[card.difficulty]
              )}
            >
              {card.difficulty}
            </span>
            <p className="text-lg font-semibold text-gray-900 leading-relaxed">{card.front}</p>
            <p className="text-xs text-gray-400 mt-4">Click to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-[#0F6E56] rounded-2xl shadow-md flex flex-col items-center justify-center p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-lg font-semibold text-white leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Result buttons — only show after flip */}
      {flipped && !answered && (
        <div className="flex gap-3 w-full">
          <button
            onClick={() => handleResult(false)}
            className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition"
          >
            ✗ Didn&apos;t know
          </button>
          <button
            onClick={() => handleResult(true)}
            className="flex-1 py-3 rounded-xl border-2 border-green-200 text-green-600 font-medium text-sm hover:bg-green-50 transition"
          >
            ✓ Got it
          </button>
        </div>
      )}

      {answered && (
        <p className="text-sm text-gray-400">Moving to next card...</p>
      )}
    </div>
  );
}
