"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useReaderStore } from "@/store/readerStore";
import { X, Play, Pause, RotateCcw, Settings, Coffee, Brain, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { playSound, SOUND_OPTIONS, type SoundId } from "@/lib/audio/pomodoroSounds";

type Mode = "work" | "short" | "long";

const DEFAULTS: Record<Mode, number> = {
  work:  25 * 60,
  short:  5 * 60,
  long:  15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  work:  "Focus",
  short: "Short Break",
  long:  "Long Break",
};

const MODE_COLORS: Record<Mode, string> = {
  work:  "#0F6E56",
  short: "#378ADD",
  long:  "#7C5CBF",
};

export function PomodoroTimer() {
  const togglePomodoro = useReaderStore((s) => s.togglePomodoro);

  const [mode,         setMode]         = useState<Mode>("work");
  const [timeLeft,     setTimeLeft]     = useState(DEFAULTS.work);
  const [running,      setRunning]      = useState(false);
  const [sessions,     setSessions]     = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [durations,    setDurations]    = useState(DEFAULTS);

  // Sound settings
  const [soundId,  setSoundId]  = useState<SoundId>("bell");
  const [volume,   setVolume]   = useState(0.8);
  const [muted,    setMuted]    = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total    = durations[mode];
  const progress = ((total - timeLeft) / total) * 100;
  const color    = MODE_COLORS[mode];

  const ring = useCallback(() => {
    if (!muted) playSound(soundId, volume);
  }, [muted, soundId, volume]);

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
      ring();

      if (completedMode === "work") {
        const newSessions = sessions + 1;
        setSessions(newSessions);
        toast.success("Focus session complete! Time for a break. 🎉");
        try {
          await axios.post("/api/stats", {
            pomodorosCompleted: 1,
            studyMinutes: Math.floor(durations.work / 60),
          });
        } catch { /* silent */ }
        switchMode("short");
      } else {
        toast.success("Break over! Ready to focus? 💪");
        switchMode("work");
      }
    },
    [ring, sessions, durations, switchMode]
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
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, handleSessionComplete]);

  function reset() {
    setRunning(false);
    setTimeLeft(durations[mode]);
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const r    = 54;
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
            {mode === "work"
              ? <Brain  size={11} className="text-white" />
              : <Coffee size={11} className="text-white" />}
          </div>
          <span className="text-sm font-semibold text-gray-900">Pomodoro</span>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {sessions} done
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Mute toggle */}
          <button
            onClick={() => setMuted(!muted)}
            title={muted ? "Unmute" : "Mute alarm"}
            className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
          >
            {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
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
          soundId={soundId}
          volume={volume}
          muted={muted}
          onChangeDuration={(m, v) => {
            const next = { ...durations, [m]: v * 60 };
            setDurations(next);
            if (m === mode) setTimeLeft(v * 60);
          }}
          onChangeSound={setSoundId}
          onChangeVolume={setVolume}
          onToggleMute={() => setMuted((p) => !p)}
          onPreview={() => playSound(soundId, volume)}
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
                  cx="60" cy="60" r={r}
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

          {/* Current sound indicator */}
          <p className="text-center text-xs text-gray-300 mt-1">
            {muted ? "🔇 Muted" : `${SOUND_OPTIONS.find((s) => s.id === soundId)?.emoji} ${SOUND_OPTIONS.find((s) => s.id === soundId)?.label}`}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Settings Panel ──────────────────────────────────────────────────── */
function SettingsPanel({
  durations,
  soundId,
  volume,
  muted,
  onChangeDuration,
  onChangeSound,
  onChangeVolume,
  onToggleMute,
  onPreview,
  onClose,
}: {
  durations: Record<Mode, number>;
  soundId: SoundId;
  volume: number;
  muted: boolean;
  onChangeDuration: (mode: Mode, minutes: number) => void;
  onChangeSound: (id: SoundId) => void;
  onChangeVolume: (v: number) => void;
  onToggleMute: () => void;
  onPreview: () => void;
  onClose: () => void;
}) {
  return (
    <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
      {/* Timer durations */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Timer</p>
        {(["work", "short", "long"] as Mode[]).map((m) => (
          <div key={m} className="flex items-center justify-between py-1.5">
            <label className="text-sm text-gray-600">{MODE_LABELS[m]}</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChangeDuration(m, Math.max(1, Math.floor(durations[m] / 60) - 1))}
                className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold transition"
              >
                −
              </button>
              <span className="text-sm font-semibold text-gray-900 w-8 text-center tabular-nums">
                {Math.floor(durations[m] / 60)}m
              </span>
              <button
                onClick={() => onChangeDuration(m, Math.min(60, Math.floor(durations[m] / 60) + 1))}
                className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold transition"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sound picker */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Alarm Sound</p>
        <div className="grid grid-cols-1 gap-1">
          {SOUND_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChangeSound(opt.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition text-left",
                soundId === opt.id
                  ? "bg-[#0F6E56]/10 text-[#0F6E56] font-medium ring-1 ring-[#0F6E56]/30"
                  : "hover:bg-gray-50 text-gray-700"
              )}
            >
              <span className="text-base">{opt.emoji}</span>
              <span>{opt.label}</span>
              {soundId === opt.id && (
                <span className="ml-auto text-[10px] font-semibold text-[#0F6E56] bg-[#0F6E56]/10 px-1.5 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Volume + mute */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Volume</p>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition flex-shrink-0",
              muted ? "bg-red-50 text-red-400" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            )}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              onChangeVolume(v);
              if (v > 0 && muted) onToggleMute();
            }}
            disabled={muted}
            className="flex-1 accent-[#0F6E56] disabled:opacity-40"
          />
          <span className="text-xs text-gray-400 w-8 text-right tabular-nums">
            {muted ? "0%" : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>

      {/* Preview + Save */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onPreview}
          disabled={muted || soundId === "none"}
          className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
        >
          Preview 🔊
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-[#0F6E56] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#085041] transition"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}
