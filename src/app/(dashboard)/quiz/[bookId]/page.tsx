"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import { ScoreScreen } from "@/components/quiz/ScoreScreen";
import type { Quiz } from "@/types";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ClipboardList, Sparkles, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function QuizPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const startTime = useRef<number>(0);
  const [timeTaken, setTimeTaken] = useState(0);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [qRes, bRes] = await Promise.all([
          axios.get(`/api/ai/quiz?bookId=${bookId}`),
          axios.get(`/api/books/${bookId}`),
        ]);
        setQuizzes(qRes.data.quizzes ?? []);
        setBookTitle(bRes.data.book?.title ?? "");
      } catch {
        // show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bookId]);

  async function generateQuiz() {
    setGenerating(true);
    try {
      const { data } = await axios.post("/api/ai/quiz", { bookId, count: 10 });
      setQuizzes((prev) => [data.quiz, ...prev]);
      toast.success("Quiz generated!");
    } catch {
      toast.error("Generation failed. Check your GEMINI_API_KEY in .env");
    } finally {
      setGenerating(false);
    }
  }

  function startQuiz(quiz: Quiz) {
    setActiveQuiz(quiz);
    setQuestionIndex(0);
    setScore(0);
    setAnswers([]);
    setDone(false);
    setTimeout(() => {
      startTime.current = Date.now();
    }, 0);
  }

  async function handleAnswer(answer: string, correct: boolean) {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    if (correct) setScore((s) => s + 1);

    setTimeout(async () => {
      if (!activeQuiz) return;
      if (questionIndex + 1 >= activeQuiz.questions.length) {
        const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
        setTimeTaken(elapsed);
        setDone(true);
        // Save attempt
        try {
          await axios.post("/api/ai/quiz/attempt", {
            quizId: activeQuiz.id,
            score: correct ? score + 1 : score,
            totalQuestions: activeQuiz.questions.length,
            timeTaken: elapsed,
            answers: newAnswers,
          });
        } catch {
          // silent
        }
      } else {
        setQuestionIndex((i) => i + 1);
      }
    }, 1000);
  }

  function handleRetry() {
    if (activeQuiz) startQuiz(activeQuiz);
  }

  if (loading) return <PageLoader />;

  // Active quiz view
  if (activeQuiz && !done) {
    const question = activeQuiz.questions[questionIndex];
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setActiveQuiz(null)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft size={15} />
            Exit Quiz
          </button>
          <h2 className="text-sm font-semibold text-gray-700 truncate max-w-xs">
            {activeQuiz.title}
          </h2>
          {activeQuiz.timeLimit ? (
            <QuizTimer
              seconds={activeQuiz.timeLimit}
              onExpire={() => {
                setTimeTaken(activeQuiz.timeLimit!);
                setDone(true);
              }}
            />
          ) : (
            <div className="text-xs text-gray-400">
              {questionIndex + 1} / {activeQuiz.questions.length}
            </div>
          )}
        </div>
        <QuestionCard
          question={question}
          index={questionIndex}
          total={activeQuiz.questions.length}
          onAnswer={handleAnswer}
        />
      </div>
    );
  }

  // Score screen
  if (activeQuiz && done) {
    return (
      <ScoreScreen
        score={score}
        total={activeQuiz.questions.length}
        timeTaken={timeTaken}
        bookId={bookId}
        onRetry={handleRetry}
      />
    );
  }

  // Quiz list
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/library"
          className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={15} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Quizzes</h1>
          {bookTitle && <p className="text-sm text-gray-500 mt-0.5">{bookTitle}</p>}
        </div>
        <button
          onClick={generateQuiz}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-[#0F6E56] text-white rounded-xl text-sm font-medium hover:bg-[#085041] transition disabled:opacity-60"
        >
          <Sparkles size={14} />
          {generating ? "Generating..." : "Generate Quiz"}
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-[#E8F5F0] rounded-2xl flex items-center justify-center mb-4">
            <ClipboardList size={28} className="text-[#0F6E56]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No quizzes yet</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Generate an AI quiz from your book content to test your knowledge.
          </p>
          <button
            onClick={generateQuiz}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0F6E56] text-white rounded-xl text-sm font-medium hover:bg-[#085041] transition disabled:opacity-60"
          >
            <Sparkles size={14} />
            {generating ? "Generating..." : "Generate Quiz"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => {
            const lastAttempt = (quiz as Quiz & { quizAttempts?: { score: number; totalQuestions: number }[] }).quizAttempts?.[0];
            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{quiz.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {quiz.questions.length} questions
                    {quiz.timeLimit ? ` · ${Math.floor(quiz.timeLimit / 60)} min` : ""}
                  </p>
                  {lastAttempt && (
                    <div className="flex items-center gap-1 mt-1">
                      <Trophy size={11} className="text-yellow-500" />
                      <span className="text-xs text-gray-500">
                        Best: {Math.round((lastAttempt.score / lastAttempt.totalQuestions) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => startQuiz(quiz)}
                  className="px-4 py-2 bg-[#0F6E56] text-white rounded-xl text-sm font-medium hover:bg-[#085041] transition"
                >
                  {lastAttempt ? "Retry" : "Start"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
