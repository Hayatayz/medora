import Link from "next/link";
import {
  BookOpen,
  Brain,
  ClipboardList,
  Timer,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#0F6E56] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="font-semibold text-gray-900">Medora</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition">Features</a>
            <a href="#how" className="hover:text-gray-900 transition">How it works</a>
            <a href="#pricing" className="hover:text-gray-900 transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-[#0F6E56] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#085041] transition"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[#E8F5F0] text-[#0F6E56] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Sparkles size={12} />
          AI-Powered Academic Reading Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 max-w-3xl mx-auto">
          Study smarter with{" "}
          <span className="text-[#0F6E56]">AI-powered</span> reading
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
          Upload any textbook and instantly get AI summaries, flashcards, quizzes, and a personal
          study assistant. Built for medicine, law, engineering, and university students.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 bg-[#0F6E56] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#085041] transition"
          >
            Start for free <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Sign in
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">No credit card required · Free to start</p>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to study better</h2>
          <p className="text-gray-500">Powered by GPT-4 and Gemini AI</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}15` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">From PDF to mastery in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload your PDF", desc: "Drag and drop any textbook or academic PDF. We support files up to 50MB." },
              { step: "2", title: "AI processes it", desc: "Our AI detects chapters, generates summaries, flashcards, and quizzes automatically." },
              { step: "3", title: "Study smarter", desc: "Read with AI assistance, study flashcards, take quizzes, and track your progress." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-[#0F6E56] text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple pricing</h2>
          <p className="text-gray-500">Start free, upgrade when you need more</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: "Free",
              price: "$0",
              desc: "Perfect for getting started",
              features: ["5 books", "AI chat (50 messages/mo)", "Basic flashcards", "Basic quizzes", "Reading progress"],
              cta: "Get started free",
              href: "/register",
              highlight: false,
            },
            {
              name: "Pro",
              price: "$9",
              desc: "For serious students",
              features: ["Unlimited books", "Unlimited AI chat", "Advanced flashcards", "Unlimited quizzes", "Video recommendations", "Pomodoro timer", "Priority support"],
              cta: "Start Pro trial",
              href: "/register",
              highlight: true,
            },
          ].map(({ name, price, desc, features, cta, href, highlight }) => (
            <div
              key={name}
              className={`rounded-2xl p-6 border ${
                highlight ? "bg-[#0F6E56] border-[#0F6E56]" : "bg-white border-gray-100"
              }`}
            >
              <p className={`text-sm font-semibold mb-1 ${highlight ? "text-[#9FE1CB]" : "text-gray-500"}`}>{name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className={`text-4xl font-bold ${highlight ? "text-white" : "text-gray-900"}`}>{price}</span>
                <span className={`text-sm mb-1 ${highlight ? "text-[#9FE1CB]" : "text-gray-400"}`}>/month</span>
              </div>
              <p className={`text-sm mb-5 ${highlight ? "text-[#9FE1CB]" : "text-gray-500"}`}>{desc}</p>
              <ul className="space-y-2.5 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className={highlight ? "text-[#9FE1CB]" : "text-[#0F6E56]"} />
                    <span className={`text-sm ${highlight ? "text-white" : "text-gray-700"}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={href}
                className={`block text-center py-3 rounded-xl text-sm font-medium transition ${
                  highlight
                    ? "bg-white text-[#0F6E56] hover:bg-gray-50"
                    : "bg-[#0F6E56] text-white hover:bg-[#085041]"
                }`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Loved by students</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, text }) => (
              <div key={name} className="bg-[#F8F7F4] rounded-2xl p-5">
                <div className="flex gap-0.5 mb-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={13} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">&ldquo;{text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="bg-[#0F6E56] rounded-3xl p-10">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to study smarter?</h2>
          <p className="text-[#9FE1CB] mb-6">Join thousands of students already using Medora.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-[#0F6E56] px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Get started free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0F6E56] rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">Medora</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 Medora. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
            <a href="#" className="hover:text-gray-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: BookOpen, title: "Smart PDF Reader", desc: "Beautiful reading experience with dark mode, adjustable fonts, bookmarks, and highlights.", color: "#0F6E56" },
  { icon: Sparkles, title: "AI Study Assistant", desc: "Ask questions about any text, get explanations, simplifications, and examples instantly.", color: "#378ADD" },
  { icon: Brain, title: "Auto Flashcards", desc: "AI generates flashcards from your chapters with spaced repetition-ready structure.", color: "#7C5CBF" },
  { icon: ClipboardList, title: "Quiz Generator", desc: "Multiple choice quizzes with explanations, timers, and score tracking.", color: "#E07B39" },
  { icon: Timer, title: "Pomodoro Timer", desc: "Built-in focus timer to keep you productive during study sessions.", color: "#E05C5C" },
  { icon: Star, title: "Progress Tracking", desc: "Track reading progress, study streaks, and performance analytics.", color: "#F59E0B" },
];

const TESTIMONIALS = [
  { name: "Sarah K.", role: "Medical Student", text: "Medora cut my study time in half. The AI flashcards from my anatomy textbook are incredible." },
  { name: "James O.", role: "Law Student", text: "I upload case law PDFs and get summaries and quizzes instantly. It's like having a tutor 24/7." },
  { name: "Priya M.", role: "Engineering Student", text: "The Pomodoro timer combined with AI chat keeps me focused and productive for hours." },
];
