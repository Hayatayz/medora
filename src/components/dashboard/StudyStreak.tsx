"use client";

import { Flame } from "lucide-react";

interface StudyStreakProps {
  streak: number;
  weekData?: boolean[];
}

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function StudyStreak({ streak, weekData = [] }: StudyStreakProps) {
  const days = weekData.length === 7 ? weekData : Array(7).fill(false);

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Study Streak</p>
          <div className="flex items-center gap-2 mt-1">
            <Flame size={20} className="text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">{streak} days</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">This week</p>
        </div>
      </div>

      <div className="flex gap-1.5">
        {DAYS.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full aspect-square rounded-lg transition-colors ${
                days[i] ? "bg-[#0F6E56]" : "bg-gray-100"
              }`}
            />
            <span className="text-xs text-gray-400">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
