"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import axios from "axios";

export function useAuth() {
  const { user, isAuthenticated, setUser, logout: clearUser } = useAuthStore();
  const router = useRouter();

  async function login(email: string, password: string) {
    const { data } = await axios.post("/api/auth/login", { email, password });
    setUser(data.user);
    router.push("/dashboard");
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await axios.post("/api/auth/register", { name, email, password });
    setUser(data.user);
    router.push("/dashboard");
  }

  async function logout() {
    await axios.post("/api/auth/logout");
    clearUser();
    router.push("/login");
  }

  async function fetchMe() {
    try {
      const { data } = await axios.get("/api/auth/me");
      setUser(data.user);
    } catch {
      clearUser();
    }
  }

  return { user, isAuthenticated, login, register, logout, fetchMe };
}
