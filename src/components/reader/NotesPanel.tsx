"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  content: string;
  pageNumber?: number;
  createdAt: string;
}

interface NotesPanelProps {
  bookId: string;
  currentPage: number;
  isDarkMode: boolean;
  onClose: () => void;
}

export function NotesPanel({ bookId, currentPage, isDarkMode, onClose }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/notes?bookId=${bookId}`)
      .then((r) => setNotes(r.data.notes))
      .catch(() => {});
  }, [bookId]);

  async function addNote() {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      const { data } = await axios.post("/api/notes", {
        bookId,
        content: newNote,
        pageNumber: currentPage,
      });
      setNotes((prev) => [data.note, ...prev]);
      setNewNote("");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id: string) {
    try {
      await axios.delete(`/api/notes?id=${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error("Failed to delete note");
    }
  }

  return (
    <div
      className={cn(
        "w-72 flex flex-col border-l h-full",
        isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          isDarkMode ? "border-gray-700" : "border-gray-100"
        )}
      >
        <p className={cn("text-sm font-semibold", isDarkMode ? "text-white" : "text-gray-900")}>
          Notes
        </p>
        <button
          onClick={onClose}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition",
            isDarkMode ? "text-gray-400 hover:bg-gray-700" : "text-gray-400 hover:bg-gray-100"
          )}
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3 border-b border-gray-100 dark:border-gray-700">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={`Note for page ${currentPage}...`}
          rows={3}
          className={cn(
            "w-full text-sm rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#0F6E56] transition",
            isDarkMode
              ? "bg-gray-800 text-white placeholder:text-gray-500 border border-gray-700"
              : "bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200"
          )}
        />
        <button
          onClick={addNote}
          disabled={saving || !newNote.trim()}
          className="mt-2 w-full bg-[#0F6E56] hover:bg-[#085041] text-white text-xs font-medium py-2 rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50"
        >
          <Plus size={13} />
          {saving ? "Saving..." : "Add Note"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {notes.length === 0 ? (
          <p className={cn("text-xs text-center py-8", isDarkMode ? "text-gray-500" : "text-gray-400")}>
            No notes yet
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "rounded-xl p-3 group",
                isDarkMode ? "bg-gray-800" : "bg-gray-50"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={cn("text-xs flex-1", isDarkMode ? "text-gray-300" : "text-gray-700")}>
                  {note.content}
                </p>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              {note.pageNumber && (
                <p className={cn("text-xs mt-1", isDarkMode ? "text-gray-600" : "text-gray-400")}>
                  Page {note.pageNumber}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
