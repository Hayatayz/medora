"use client";

import { Trophy, RotateCcw, Brain } from "lucide-react";
import Link from "next/link";

interface ScoreScreenProps {
  score: number;
  total: number;
  timeTaken: number;
  bookId: string;
  onRetry: () => void;
}

export function ScoreScreen({ score, total, timeTaken, bookId, onRetry }: ScoreScreenProps) {
  const pct = Math.round((score / total) * 100);
  const grade =
    pct >= 90 ? "Excellent!" : pct >= 70 ? "Good job!" : pct >= 50 ? "Keep practicing!" : "Keep studying!";
  const color =
    pct >= 90 ? "text-green-600" : pct >= 70 ? "text-[#0F6E56]" : pct >= 50 ? "text-yellow-600" : "text-red-500";

  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
      <div className="w-24 h-24 bg-[#E8F5F0] rounded-full flex items-center justify-center mb-6">
        <Trophy size={40} className="text-[#0F6E56]" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-1">{grade}</h2>
      <p className="text-gray-500 mb-6">Quiz complete</p>

      <div className="w-32 h-32 relative mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#0F6E56"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{pct}%</span>
          <span className="text-xs text-gray-400">score</span>
        </div>
      </div>

      <div className="flex gap-6 mb-8 text-center">
        <div>
          <p className="text-2xl font-bold text-gray-900">{score}</p>
          <p className="text-xs text-gray-400">Correct</p>
        </div>
        <div className="w-px bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-gray-900">{total - score}</p>
          <p className="text-xs text-gray-400">Wrong</p>
        </div>
        <div className="w-px bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-gray-900">
            {mins}:{String(secs).padStart(2, "0")}
          </p>
          <p className="text-xs text-gray-400">Time</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0F6E56] text-white rounded-xl text-sm font-medium hover:bg-[#085041] transition"
        >
          <RotateCcw size={14} />
          Try Again
        </button>
        <Link
          href={`/flashcards/${bookId}`}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          <Brain size={14} />
          Flashcards
        </Link>
      </div>
    </div>
  );
}
