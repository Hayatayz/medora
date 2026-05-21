import { create } from "zustand";

interface ReaderState {
  currentPage: number;
  currentChapterId: string | null;
  fontSize: number;
  isDarkMode: boolean;
  isFocusMode: boolean;
  isAIPanelOpen: boolean;
  selectedText: string;
  isPomodoroOpen: boolean;
  setCurrentPage: (page: number) => void;
  setCurrentChapter: (id: string) => void;
  setFontSize: (size: number) => void;
  toggleDarkMode: () => void;
  toggleFocusMode: () => void;
  toggleAIPanel: () => void;
  setSelectedText: (text: string) => void;
  togglePomodoro: () => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  currentPage: 1,
  currentChapterId: null,
  fontSize: 16,
  isDarkMode: false,
  isFocusMode: false,
  isAIPanelOpen: false,
  selectedText: "",
  isPomodoroOpen: false,
  setCurrentPage: (page) => set({ currentPage: page }),
  setCurrentChapter: (id) => set({ currentChapterId: id }),
  setFontSize: (size) => set({ fontSize: size }),
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  toggleFocusMode: () => set((s) => ({ isFocusMode: !s.isFocusMode })),
  toggleAIPanel: () => set((s) => ({ isAIPanelOpen: !s.isAIPanelOpen })),
  setSelectedText: (text) => set({ selectedText: text }),
  togglePomodoro: () => set((s) => ({ isPomodoroOpen: !s.isPomodoroOpen })),
}));