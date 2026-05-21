"use client";

import { useEffect, useState } from "react";
import { BentoGrid } from "@/components/dashboard/BentoGrid";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import type { Book } from "@/types";
import { PageLoader } from "@/components/shared/LoadingSpinner";

interface DashboardStats {
  booksRead: number;
  flashcardsStudied: number;
  quizzesTaken: number;
  studyMinutes: number;
  pomodorosCompleted: number;
  streakDay: number;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats>({
    booksRead: 0,
    flashcardsStudied: 0,
    quizzesTaken: 0,
    studyMinutes: 0,
    pomodorosCompleted: 0,
    streakDay: 0,
  });
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [weekData, setWeekData] = useState<boolean[]>(Array(7).fill(false));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, booksRes] = await Promise.all([
          axios.get("/api/stats"),
          axios.get("/api/books?limit=4"),
        ]);
        setStats({
          booksRead: statsRes.data.booksRead ?? 0,
          flashcardsStudied: statsRes.data.flashcardsStudied ?? 0,
          quizzesTaken: statsRes.data.quizzesTaken ?? 0,
          studyMinutes: statsRes.data.studyMinutes ?? 0,
          pomodorosCompleted: statsRes.data.pomodorosCompleted ?? 0,
          streakDay: statsRes.data.streakDay ?? 0,
        });
        setWeekData(statsRes.data.weekData ?? Array(7).fill(false));
        setRecentBooks(booksRes.data.books ?? []);
      } catch {
        // silently show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here&apos;s what&apos;s happening with your studies today.
        </p>
      </div>
      <BentoGrid stats={stats} recentBooks={recentBooks} weekData={weekData} />
    </div>
  );
}
