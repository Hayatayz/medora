import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-8 h-8 bg-[#0F6E56] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-semibold text-lg text-gray-900">Medora</span>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h2>
          <p className="text-gray-500 text-sm mb-8">
            Enter your email and we&apos;ll send you a reset link.
          </p>
          <ForgotPasswordForm />
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-[#0F6E56] hover:underline font-medium">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
