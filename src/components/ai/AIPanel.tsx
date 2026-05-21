"use client";

import { useState, useRef, useEffect } from "react";
import { useReaderStore } from "@/store/readerStore";
import { ChatBubble } from "./ChatBubble";
import { ContextMenu } from "./ContextMenu";
import { cn } from "@/lib/utils";
import { Send, X, Loader2, Sparkles } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIPanelProps {
  bookId: string;
  chapterId?: string;
  isDarkMode: boolean;
}

export function AIPanel({ bookId, chapterId, isDarkMode }: AIPanelProps) {
  const { toggleAIPanel, selectedText, setSelectedText } = useReaderStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI study assistant. Ask me anything about this book, or select text to get explanations, summaries, and more.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || loading) return;

    setInput("");
    setSelectedText("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const { data } = await axios.post("/api/ai/chat", {
        message: msg,
        bookId,
        chapterId,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      toast.error("AI is unavailable. Check your API key.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that. Please check your OpenAI API key in .env.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleContextAction(action: string, text: string) {
    const prompts: Record<string, string> = {
      explain: `Explain this in simple terms: "${text}"`,
      simplify: `Simplify this text for easier understanding: "${text}"`,
      examples: `Give me 2-3 real-world examples related to: "${text}"`,
      translate: `Translate this to simple English and explain key terms: "${text}"`,
    };
    sendMessage(prompts[action] ?? `Tell me about: "${text}"`);
  }

  return (
    <div
      className={cn(
        "w-80 flex flex-col border-l h-full",
        isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"
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
          <div className="w-6 h-6 bg-[#0F6E56] rounded-lg flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <p className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>
            AI Assistant
          </p>
        </div>
        <button
          onClick={toggleAIPanel}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition",
            isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-400 hover:bg-gray-100"
          )}
        >
          <X size={14} />
        </button>
      </div>

      {/* Context actions for selected text */}
      {selectedText && (
        <div
          className={cn(
            "px-3 py-3 border-b",
            isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-100 bg-gray-50"
          )}
        >
          <p
            className={cn(
              "text-xs mb-2 line-clamp-2 italic",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}
          >
            &ldquo;{selectedText}&rdquo;
          </p>
          <ContextMenu
            selectedText={selectedText}
            onAction={handleContextAction}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} isDarkMode={isDarkMode} />
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0F6E56] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <div
              className={cn(
                "px-3 py-2.5 rounded-2xl rounded-tl-sm",
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              )}
            >
              <Loader2 size={14} className="animate-spin text-[#0F6E56]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className={cn(
          "p-3 border-t",
          isDarkMode ? "border-gray-700" : "border-gray-100"
        )}
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask anything..."
            className={cn(
              "flex-1 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F6E56] transition",
              isDarkMode
                ? "bg-gray-800 text-white placeholder:text-gray-500 border border-gray-700"
                : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200"
            )}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-[#0F6E56] hover:bg-[#085041] text-white rounded-xl flex items-center justify-center transition disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
