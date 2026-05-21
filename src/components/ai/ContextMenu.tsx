"use client";

import { cn } from "@/lib/utils";
import { Sparkles, BookOpen, Languages, Lightbulb } from "lucide-react";

interface ContextMenuProps {
  selectedText: string;
  onAction: (action: string, text: string) => void;
  isDarkMode?: boolean;
}

const ACTIONS = [
  { id: "explain", label: "Explain this", icon: Sparkles },
  { id: "simplify", label: "Simplify", icon: BookOpen },
  { id: "examples", label: "Give examples", icon: Lightbulb },
  { id: "translate", label: "Translate", icon: Languages },
];

export function ContextMenu({ selectedText, onAction, isDarkMode }: ContextMenuProps) {
  if (!selectedText) return null;

  return (
    <div className="space-y-1">
      <p
        className={cn(
          "text-xs font-medium px-1 mb-2",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}
      >
        Selected text actions
      </p>
      {ACTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onAction(id, selectedText)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition text-left",
            isDarkMode
              ? "text-gray-300 hover:bg-gray-700"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          <Icon size={14} className="text-[#0F6E56]" />
          {label}
        </button>
      ))}
    </div>
  );
}
