"use client";

import { StatsCard } from "./StatsCard";
import { RecentBooks } from "./RecentBooks";
import { StudyStreak } from "./StudyStreak";
import { BookOpen, Brain, ClipboardList, Clock, Timer } from "lucide-react";
import type { Book } from "@/types";
import Link from "next/link";
import { useReaderStore } from "@/store/readerStore";

interface BentoGridProps {
  stats: {
    booksRead: number;
    flashcardsStudied: number;
    quizzesTaken: number;
    studyMinutes: number;
    pomodorosCompleted: number;
    streakDay: number;
  };
  recentBooks: Book[];
  weekData: boolean[];
}

export function BentoGrid({ stats, recentBooks, weekData }: BentoGridProps) {
  const togglePomodoro = useReaderStore((s) => s.togglePomodoro);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Books in Library"
          value={stats.booksRead}
          icon={BookOpen}
          color="#0F6E56"
          subtitle="Total uploaded"
        />
        <StatsCard
          title="Flashcards Studied"
          value={stats.flashcardsStudied}
          icon={Brain}
          color="#378ADD"
          subtitle="All time"
        />
        <StatsCard
          title="Quizzes Taken"
          value={stats.quizzesTaken}
          icon={ClipboardList}
          color="#7C5CBF"
          subtitle="All time"
        />
        <StatsCard
          title="Study Time"
          value={`${Math.floor(stats.studyMinutes / 60)}h ${stats.studyMinutes % 60}m`}
          icon={Clock}
          color="#E07B39"
          subtitle="Total this week"
        />
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentBooks books={recentBooks} />
        </div>
        <div className="space-y-4">
          <StudyStreak streak={stats.streakDay} weekData={weekData} />

          {/* Pomodoro quick start */}
          <button
            onClick={togglePomodoro}
            className="w-full bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition">
                <Timer size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Pomodoro Timer</p>
                <p className="text-xs text-gray-400">
                  {stats.pomodorosCompleted} sessions completed
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Start a 25-minute focus session to boost your productivity.
            </p>
            <div className="mt-3 bg-orange-500 text-white text-xs font-medium py-2 rounded-xl text-center group-hover:bg-orange-600 transition">
              Start Focus Session
            </div>
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Upload Book", href: "/library", color: "#0F6E56", icon: BookOpen },
          { label: "Study Flashcards", href: "/library", color: "#378ADD", icon: Brain },
          { label: "Take a Quiz", href: "/library", color: "#7C5CBF", icon: ClipboardList },
          { label: "View Progress", href: "/progress", color: "#E07B39", icon: Clock },
        ].map(({ label, href, color, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-3 group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15` }}
            >
              <Icon size={16} style={{ color }} />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
