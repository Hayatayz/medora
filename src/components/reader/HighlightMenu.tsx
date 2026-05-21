"use client";

import { MessageSquare } from "lucide-react";

const COLORS = [
  { name: "yellow", bg: "#FEF08A", label: "Yellow" },
  { name: "green", bg: "#BBF7D0", label: "Green" },
  { name: "blue", bg: "#BFDBFE", label: "Blue" },
  { name: "pink", bg: "#FBCFE8", label: "Pink" },
];

interface HighlightMenuProps {
  x: number;
  y: number;
  onHighlight: (color: string) => void;
  onAskAI: () => void;
  onClose: () => void;
}

export function HighlightMenu({ x, y, onHighlight, onAskAI, onClose }: HighlightMenuProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex items-center gap-1"
        style={{ left: x, top: y - 52 }}
      >
        {COLORS.map((c) => (
          <button
            key={c.name}
            onClick={() => onHighlight(c.name)}
            title={c.label}
            className="w-7 h-7 rounded-lg border-2 border-transparent hover:border-gray-300 transition"
            style={{ background: c.bg }}
          />
        ))}
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          onClick={onAskAI}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0F6E56] text-white text-xs font-medium rounded-lg hover:bg-[#085041] transition"
        >
          <MessageSquare size={12} />
          Ask AI
        </button>
      </div>
    </>
  );
}
