import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
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
            Study smarter,
            <br />
            not harder.
          </h1>
          <p className="text-[#9FE1CB] text-lg">
            AI-powered reading platform for medicine, law, engineering and university students.
          </p>
        </div>
        <div className="flex gap-4">
          {["10k+ Students", "50k+ Books", "AI Powered"].map((stat) => (
            <div key={stat} className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-white text-sm font-medium">{stat}</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1">Sign in to continue studying</p>
          </div>
          <LoginForm />
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#0F6E56] font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
