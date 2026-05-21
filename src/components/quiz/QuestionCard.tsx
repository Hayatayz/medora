"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  onAnswer: (answer: string, correct: boolean) => void;
}

export function QuestionCard({ question, index, total, onAnswer }: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  function handleSelect(option: string) {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    const correct = option === question.answer;
    setTimeout(() => onAnswer(option, correct), 900);
  }

  function getOptionStyle(option: string) {
    if (!revealed) {
      return "border-gray-200 bg-white hover:border-[#0F6E56] hover:bg-[#F0FAF6] cursor-pointer";
    }
    if (option === question.answer) {
      return "border-green-400 bg-green-50 text-green-800";
    }
    if (option === selected && option !== question.answer) {
      return "border-red-400 bg-red-50 text-red-800";
    }
    return "border-gray-100 bg-gray-50 text-gray-400";
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          Question {index + 1} of {total}
        </span>
      </div>

      <p className="text-base font-semibold text-gray-900 mb-5 leading-relaxed">
        {question.question}
      </p>

      <div className="space-y-2.5">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-between",
              getOptionStyle(option)
            )}
          >
            <span>{option}</span>
            {revealed && option === question.answer && (
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
            )}
            {revealed && option === selected && option !== question.answer && (
              <XCircle size={16} className="text-red-500 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {revealed && question.explanation && (
        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
          <p className="text-xs text-blue-600 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
