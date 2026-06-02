"use client";

import { useState, useRef, useEffect } from "react";
import { useReaderStore } from "@/store/readerStore";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  { label: "Summarize", prompt: "Summarize the selected text or current chapter." },
  { label: "Explain this", prompt: "Explain this in simple terms." },
  { label: "Quiz me", prompt: "Create 3 quiz questions based on this content." },
  { label: "Proofread", prompt: "Proofread and correct this text." },
];

interface AIPanelProps {
  bookId: string;
  chapterId?: string;
  isDarkMode: boolean;
}

export function AIPanel({ bookId, chapterId, isDarkMode }: AIPanelProps) {
  const { selectedText, toggleAIPanel } = useReaderStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("/api/ai/chat", {
        bookId,
        chapterId,
        message: text,
        selectedText: selectedText || undefined,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "w-80 flex flex-col border-l h-full",
        isDarkMode
          ? "bg-gray-900 border-gray-700 text-white"
          : "bg-white border-gray-100 text-gray-900"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          isDarkMode ? "border-gray-700" : "border-gray-100"
        )}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#0F6E56]" />
          <span className="font-semibold text-sm">AI Assistant</span>
        </div>
        <button
          onClick={toggleAIPanel}
          className={cn(
            "p-1 rounded-lg transition",
            isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
          )}
        >
          <X size={16} />
        </button>
      </div>

      {/* Quick actions */}
      <div className={cn("p-3 border-b", isDarkMode ? "border-gray-700" : "border-gray-100")}>
        <p className={cn("text-xs mb-2", isDarkMode ? "text-gray-400" : "text-gray-500")}>
          Quick actions
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => send(action.prompt)}
              className={cn(
                "text-xs px-3 py-2 rounded-lg text-left transition font-medium",
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div className="w-10 h-10 rounded-full bg-[#0F6E56]/10 flex items-center justify-center">
              <Sparkles size={18} className="text-[#0F6E56]" />
            </div>
            <p className={cn("text-xs text-center", isDarkMode ? "text-gray-500" : "text-gray-400")}>
              Select text in the PDF or use a quick action to get started
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                msg.role === "user"
                  ? "bg-[#0F6E56] text-white rounded-br-sm"
                  : isDarkMode
                  ? "bg-gray-800 text-gray-200 rounded-bl-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className={cn(
                "rounded-2xl rounded-bl-sm px-3 py-2",
                isDarkMode ? "bg-gray-800" : "bg-gray-100"
              )}
            >
              <Loader2 size={14} className="animate-spin text-[#0F6E56]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={cn("p-3 border-t", isDarkMode ? "border-gray-700" : "border-gray-100")}>
        {selectedText && (
          <div
            className={cn(
              "text-xs px-2 py-1.5 rounded-lg mb-2 italic truncate",
              isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-500"
            )}
          >
            📎 &ldquo;{selectedText.slice(0, 60)}{selectedText.length > 60 ? "…" : ""}&rdquo;
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Ask anything…"
            className={cn(
              "flex-1 text-xs px-3 py-2 rounded-xl border outline-none transition",
              isDarkMode
                ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#0F6E56]"
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#0F6E56]"
            )}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="p-2 bg-[#0F6E56] text-white rounded-xl hover:bg-[#085041] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}