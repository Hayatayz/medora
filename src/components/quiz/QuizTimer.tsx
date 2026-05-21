"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  seconds: number;
  onExpire: () => void;
}

export function QuizTimer({ seconds, onExpire }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, onExpire]);

  const pct = (timeLeft / seconds) * 100;
  const urgent = timeLeft <= 30;

  return (
    <div className={cn("flex items-center gap-2", urgent ? "text-red-500" : "text-gray-600")}>
      <Clock size={15} />
      <span className="text-sm font-semibold tabular-nums">
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </span>
      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            urgent ? "bg-red-500" : "bg-[#0F6E56]"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
