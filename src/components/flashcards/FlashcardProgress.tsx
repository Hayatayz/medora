"use client";

interface FlashcardProgressProps {
  current: number;
  total: number;
  correct: number;
  wrong: number;
}

export function FlashcardProgress({ current, total, correct, wrong }: FlashcardProgressProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">
          {current} / {total} cards
        </span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-green-600 font-medium">✓ {correct}</span>
          <span className="text-red-500 font-medium">✗ {wrong}</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#0F6E56] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
