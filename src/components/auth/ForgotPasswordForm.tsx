"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
    toast.success("Reset link sent! Check your inbox.");
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-[#E1F5EE] rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="text-[#0F6E56]" size={28} />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Check your email</h3>
        <p className="text-sm text-gray-500">
          We sent a reset link to{" "}
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent transition text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0F6E56] hover:bg-[#085041] text-white py-3 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
