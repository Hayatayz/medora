import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F6E56] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#0F6E56] font-bold text-sm">M</span>
          </div>
          <span className="text-white font-semibold text-lg">Medora</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your AI study
            <br />
            companion awaits.
          </h1>
          <p className="text-[#9FE1CB] text-lg">
            Upload any textbook and let AI generate summaries, flashcards and quizzes instantly.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "AI Summaries", desc: "Chapter summaries in seconds" },
            { label: "Smart Flashcards", desc: "Auto-generated from your books" },
            { label: "Quiz Generator", desc: "Practice with AI questions" },
            { label: "Pomodoro Timer", desc: "Stay focused while studying" },
          ].map((f) => (
            <div key={f.label} className="bg-white/10 rounded-xl p-3">
              <p className="text-white text-sm font-medium">{f.label}</p>
              <p className="text-[#9FE1CB] text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-[#0F6E56] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">Medora</span>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-500 mt-1">Start studying smarter today — it&apos;s free</p>
          </div>
          <RegisterForm />
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0F6E56] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
