"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Users, BookOpen, ClipboardList, Brain } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalBooks: number;
  totalQuizzes: number;
  totalFlashcards: number;
}

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalBooks: 0,
    totalQuizzes: 0,
    totalFlashcards: 0,
  });

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    // Placeholder — wire up admin API routes later
    const loadStats = () => {
      setStats({ totalUsers: 1, totalBooks: 0, totalQuizzes: 0, totalFlashcards: 0 });
    };
    loadStats();
  }, []);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-[#F8F7F4] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Platform overview</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: Users, color: "#0F6E56" },
            { label: "Total Books", value: stats.totalBooks, icon: BookOpen, color: "#378ADD" },
            { label: "Total Quizzes", value: stats.totalQuizzes, icon: ClipboardList, color: "#7C5CBF" },
            { label: "Flashcards", value: stats.totalFlashcards, icon: Brain, color: "#E07B39" },
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
      </div>
    </div>
  );
}
