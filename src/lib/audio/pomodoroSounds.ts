/**
 * Pomodoro alarm sounds — synthesized via Web Audio API.
 * No external files required.
 */

export type SoundId = "bell" | "digital" | "chime" | "gentle" | "none";

export interface SoundOption {
  id: SoundId;
  label: string;
  emoji: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: "bell",    label: "Bell",         emoji: "🔔" },
  { id: "digital", label: "Digital",      emoji: "📳" },
  { id: "chime",   label: "Chime",        emoji: "🎵" },
  { id: "gentle",  label: "Gentle Ping",  emoji: "✨" },
  { id: "none",    label: "Silent",       emoji: "🔇" },
];

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}

/** Bell — classic church-bell overtone series */
function playBell(volume: number) {
  const ctx = getCtx();
  if (!ctx) return;

  const freqs   = [440, 880, 1320, 1760];
  const gains   = [1, 0.6, 0.4, 0.2];
  const now     = ctx.currentTime;

  freqs.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type      = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(gains[i] * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.start(now);
    osc.stop(now + 2.5);
  });
}

/** Digital — two short beeps */
function playDigital(volume: number) {
  const ctx = getCtx();
  if (!ctx) return;

  [0, 0.25].forEach((offset) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime + offset;
    osc.type      = "square";
    osc.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.start(now);
    osc.stop(now + 0.18);
  });
}

/** Chime — ascending three-note arpeggio */
function playChime(volume: number) {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
  notes.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime + i * 0.18;
    osc.type      = "triangle";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume * 0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.start(now);
    osc.stop(now + 0.8);
  });
}

/** Gentle ping — soft sine pulse */
function playGentle(volume: number) {
  const ctx = getCtx();
  if (!ctx) return;

  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  osc.type      = "sine";
  osc.frequency.setValueAtTime(528, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume * 0.6, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

  osc.start(now);
  osc.stop(now + 1.8);
}

export function playSound(id: SoundId, volume = 0.8) {
  if (id === "none") return;
  try {
    switch (id) {
      case "bell":    playBell(volume);    break;
      case "digital": playDigital(volume); break;
      case "chime":   playChime(volume);   break;
      case "gentle":  playGentle(volume);  break;
    }
  } catch (e) {
    console.warn("Audio playback failed:", e);
  }
}
