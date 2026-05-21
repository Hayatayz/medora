export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  description?: string;
  coverUrl?: string;
  fileUrl: string;
  fileSize: number;
  pageCount: number;
  category?: string;
  isProcessed: boolean;
  createdAt: string;
  chapters?: Chapter[];
  readingProgress?: ReadingProgress;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  pageStart: number;
  pageEnd: number;
  bookId: string;
}

export interface ReadingProgress {
  currentPage: number;
  totalPages: number;
  percentage: number;
  lastReadAt: string;
  chapterId?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  bookId: string;
  chapterId?: string;
}

export interface Quiz {
  id: string;
  title: string;
  timeLimit?: number;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface StudyStats {
  studyMinutes: number;
  pagesRead: number;
  flashcardsStudied: number;
  quizzesTaken: number;
  pomodorosCompleted: number;
  streakDay: number;
}