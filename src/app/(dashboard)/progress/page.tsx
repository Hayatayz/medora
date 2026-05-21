"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { BookOpen, Brain, ClipboardList, Clock, Flame, Timer } from "lucide-react";
import { PageLoader } from "@/components/shared/LoadingSpinner";

interface ProgressItem {
  id: string;
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastReadAt: string;
  book: { title: string; coverUrl?: string };
}

interface StatRow {
  date: string;
  studyMinutes: number;
  pomodorosCompleted: number;
  flashcardsStudied: number;
  quizzesTaken: number;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [stats, setStats] = useState({
    booksRead: 0,
    flashcardsStudied: 0,
    quizzesTaken: 0,
    studyMinutes: 0,
    pomodorosCompleted: 0,
    streakDay: 0,
  });
  const [recentStats, setRecentStats] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [progressRes, statsRes] = await Promise.all([
          axios.get("/api/progress"),
          axios.get("/api/stats"),
        ]);
        setProgress(progressRes.data.progress ?? []);
        setStats({
          booksRead: statsRes.data.booksRead ?? 0,
          flashcardsStudied: statsRes.data.flashcardsStudied ?? 0,
          quizzesTaken: statsRes.data.quizzesTaken ?? 0,
          studyMinutes: statsRes.data.studyMinutes ?? 0,
          pomodorosCompleted: statsRes.data.pomodorosCompleted ?? 0,
          streakDay: statsRes.data.streakDay ?? 0,
        });
        setRecentStats(statsRes.data.recentStats ?? []);
      } catch {
        // show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <PageLoader />;

  // Build chart data from last 7 days
  const chartData = Array(7)
    .fill(null)
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayLabel = DAY_LABELS[(d.getDay() + 6) % 7];
      const dateStr = d.toISOString().split("T")[0];
      const row = recentStats.find((r) => r.date?.startsWith(dateStr));
      return { day: dayLabel, minutes: row?.studyMinutes ?? 0 };
    });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Progress</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your study journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Books in Library", value: stats.booksRead, icon: BookOpen, color: "#0F6E56" },
          {
            label: "Flashcards Studied",
            value: stats.flashcardsStudied,
            icon: Brain,
            color: "#378ADD",
          },
          {
            label: "Quizzes Taken",
            value: stats.quizzesTaken,
            icon: ClipboardList,
            color: "#7C5CBF",
          },
          {
            label: "Study Time",
            value: `${Math.floor(stats.studyMinutes / 60)}h ${stats.studyMinutes % 60}m`,
            icon: Clock,
            color: "#E07B39",
          },
          {
            label: "Pomodoros Done",
            value: stats.pomodorosCompleted,
            icon: Timer,
            color: "#E05C5C",
          },
          {
            label: "Study Streak",
            value: `${stats.streakDay} day${stats.streakDay !== 1 ? "s" : ""}`,
            icon: Flame,
            color: "#F59E0B",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${color}15` }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Weekly Study Time (minutes)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              unit="m"
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #F3F4F6",
                fontSize: 12,
              }}
              formatter={(v) => [`${v ?? 0} min`, "Study time"]}
            />
            <Bar dataKey="minutes" fill="#0F6E56" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Book progress list */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Reading Progress</h2>
        {progress.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No reading progress yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Start reading a book to track progress
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {progress.map((p) => (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                    {p.book.title}
                  </p>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    {p.currentPage} / {p.totalPages} · {Math.round(p.percentage)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F6E56] rounded-full transition-all"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
