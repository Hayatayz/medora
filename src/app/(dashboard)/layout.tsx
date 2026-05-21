"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";
import { DashboardNavbar } from "@/components/shared/Navbar";
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";
import { useReaderStore } from "@/store/readerStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isPomodoroOpen = useReaderStore((s) => s.isPomodoroOpen);
  const pathname = usePathname();

  // Reader gets its own full-screen layout — no sidebar/navbar
  const isReader = pathname.startsWith("/reader/");

  if (isReader) {
    return (
      <>
        {children}
        {isPomodoroOpen && <PomodoroTimer />}
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F7F4] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-56 overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      {isPomodoroOpen && <PomodoroTimer />}
    </div>
  );
}
