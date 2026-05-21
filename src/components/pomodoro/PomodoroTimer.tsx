"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useReaderStore } from "@/store/readerStore";
import { X, Play, Pause, RotateCcw, Settings, Coffee, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";

type Mode = "work" | "short" | "long";

const DEFAULTS: Record<Mode, number> = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  work: "Focus",
  short: "Short Break",
  long: "Long Break",
};

const MODE_COLORS: Record<Mode, string> = {
  work: "#0F6E56",
  short: "#378ADD",
  long: "#7C5CBF",
};

export function PomodoroTimer() {
  const togglePomodoro = useReaderStore((s) => s.togglePomodoro);
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(DEFAULTS.work);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [durations, setDurations] = useState(DEFAULTS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = durations[mode];
  const progress = ((total - timeLeft) / total) * 100;
  const color = MODE_COLORS[mode];

  const switchMode = useCallback(
    (m: Mode) => {
      setMode(m);
      setTimeLeft(durations[m]);
      setRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [durations]
  );

  const handleSessionComplete = useCallback(
    async (completedMode: Mode) => {
      if (completedMode === "work") {
        const newSessions = sessions + 1;
        setSessions(newSessions);
        toast.success("Focus session complete! Time for a break. 🎉");
        // Save to stats
        try {
          await axios.post("/api/stats", {
            pomodorosCompleted: 1,
            studyMinutes: Math.floor(durations.work / 60),
          });
        } catch {
          // silent
        }
        switchMode("short");
      } else {
        toast.success("Break over! Ready to focus? 💪");
        switchMode("work");
      }
    },
    [sessions, durations, switchMode]
  );

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            handleSessionComplete(mode);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, mode, handleSessionComplete]);

  function reset() {
    setRunning(false);
    setTimeLeft(durations[mode]);
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  // SVG circle
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ - (progress / 100) * circ;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: color }}
          >
            {mode === "work" ? (
              <Brain size={11} className="text-white" />
            ) : (
              <Coffee size={11} className="text-white" />
            )}
          </div>
          <span className="text-sm font-semibold text-gray-900">Pomodoro</span>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {sessions} done
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
          >
            <Settings size={13} />
          </button>
          <button
            onClick={togglePomodoro}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {showSettings ? (
        <SettingsPanel
          durations={durations}
          onChange={(m, v) => {
            const newDurations = { ...durations, [m]: v * 60 };
            setDurations(newDurations);
            if (m === mode) setTimeLeft(v * 60);
          }}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <div className="p-4">
          {/* Mode tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
            {(["work", "short", "long"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  "flex-1 text-xs font-medium py-1.5 rounded-lg transition",
                  mode === m
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {m === "work" ? "Focus" : m === "short" ? "Short" : "Long"}
              </button>
            ))}
          </div>

          {/* Circle timer */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={r} fill="none" stroke="#F3F4F6" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dash}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 tabular-nums">
                  {mins}:{secs}
                </span>
                <span className="text-xs text-gray-400 mt-0.5">{MODE_LABELS[mode]}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={() => setRunning(!running)}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white transition shadow-lg hover:opacity-90 active:scale-95"
              style={{ background: color }}
            >
              {running ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
            </button>
            <div className="w-9 h-9" />
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, background: color }}
            />
          </div>
          <p className="text-center text-xs text-gray-400 mt-1.5">
            {Math.round(progress)}% complete
          </p>
        </div>
      )}
    </div>
  );
}

function SettingsPanel({
  durations,
  onChange,
  onClose,
}: {
  durations: Record<Mode, number>;
  onChange: (mode: Mode, minutes: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-900 mb-3">Timer Settings</p>
      {(["work", "short", "long"] as Mode[]).map((m) => (
        <div key={m} className="flex items-center justify-between">
          <label className="text-sm text-gray-600">{MODE_LABELS[m]}</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChange(m, Math.max(1, Math.floor(durations[m] / 60) - 1))}
              className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold transition"
            >
              −
            </button>
            <span className="text-sm font-semibold text-gray-900 w-8 text-center tabular-nums">
              {Math.floor(durations[m] / 60)}m
            </span>
            <button
              onClick={() => onChange(m, Math.min(60, Math.floor(durations[m] / 60) + 1))}
              className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold transition"
            >
              +
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={onClose}
        className="w-full mt-2 bg-[#0F6E56] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#085041] transition"
      >
        Save & Close
      </button>
    </div>
  );
}
