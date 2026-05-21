"use client";

import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  isDarkMode?: boolean;
}

export function ChatBubble({ role, content, isDarkMode }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-6 h-6 bg-[#0F6E56] rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
          <span className="text-white text-xs font-bold">M</span>
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-[#0F6E56] text-white rounded-tr-sm"
            : isDarkMode
            ? "bg-gray-700 text-gray-100 rounded-tl-sm"
            : "bg-gray-100 text-gray-800 rounded-tl-sm"
        )}
      >
        {content}
      </div>
    </div>
  );
}
