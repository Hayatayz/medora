"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  Brain,
  ClipboardList,
  BarChart3,
  Settings,
  Timer,
} from "lucide-react";
import { useReaderStore } from "@/store/readerStore";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/library", icon: Library, label: "Library" },
  { href: "/progress", icon: BarChart3, label: "Progress" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const togglePomodoro = useReaderStore((s) => s.togglePomodoro);

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col h-full fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#0F6E56] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          <span className="font-semibold text-gray-900">Medora</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-[#E8F5F0] text-[#0F6E56]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}

        <div className="pt-3 pb-1">
          <p className="text-xs font-medium text-gray-400 px-3 mb-1">Study Tools</p>
        </div>

        <Link
          href="/library"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname.startsWith("/reader")
              ? "bg-[#E8F5F0] text-[#0F6E56]"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <BookOpen size={17} />
          Reader
        </Link>

        <Link
          href="/library"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname.startsWith("/flashcards")
              ? "bg-[#E8F5F0] text-[#0F6E56]"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Brain size={17} />
          Flashcards
        </Link>

        <Link
          href="/library"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname.startsWith("/quiz")
              ? "bg-[#E8F5F0] text-[#0F6E56]"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <ClipboardList size={17} />
          Quizzes
        </Link>

        <button
          onClick={togglePomodoro}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <Timer size={17} />
          Pomodoro
        </button>
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100">
        <div className="bg-[#F0FAF6] rounded-xl p-3">
          <p className="text-xs font-semibold text-[#0F6E56] mb-0.5">Pro tip</p>
          <p className="text-xs text-gray-500">Use the Pomodoro timer to stay focused during study sessions.</p>
        </div>
      </div>
    </aside>
  );
}
