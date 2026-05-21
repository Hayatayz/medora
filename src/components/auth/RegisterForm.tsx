"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const password = watch("password", "");
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success("Account created! Welcome to Medora.");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
        <input
          {...register("name")}
          type="text"
          placeholder="Your full name"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent transition text-sm"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
        <input
          {...register("email")}
          type="email"
          placeholder="you@university.edu"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent transition text-sm"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent transition text-sm pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {password && (
          <div className="mt-2 space-y-1">
            {[
              { key: "length", label: "At least 8 characters" },
              { key: "upper", label: "One uppercase letter" },
              { key: "number", label: "One number" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Check
                  size={12}
                  className={
                    checks[key as keyof typeof checks] ? "text-[#0F6E56]" : "text-gray-300"
                  }
                />
                <span
                  className={`text-xs ${
                    checks[key as keyof typeof checks] ? "text-[#0F6E56]" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0F6E56] hover:bg-[#085041] text-white py-3 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Creating account..." : "Create free account"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        By signing up you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
