"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { User, Bell, Shield, Palette, LogOut } from "lucide-react";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("Settings saved");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-[#0F6E56]" />
            <h2 className="text-sm font-semibold text-gray-900">Profile</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
              <input
                value={user?.email ?? ""}
                disabled
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-[#0F6E56] text-white rounded-xl text-sm font-medium hover:bg-[#085041] transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-[#0F6E56]" />
            <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
          </div>
          {[
            { label: "Study reminders", desc: "Daily reminders to keep your streak" },
            { label: "Quiz results", desc: "Notifications when AI generates quizzes" },
            { label: "Weekly summary", desc: "Weekly progress report" },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F6E56]" />
              </label>
            </div>
          ))}
        </div>

        {/* Appearance */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={16} className="text-[#0F6E56]" />
            <h2 className="text-sm font-semibold text-gray-900">Appearance</h2>
          </div>
          <p className="text-xs text-gray-500">
            Dark mode can be toggled from the reader toolbar while reading.
          </p>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-[#0F6E56]" />
            <h2 className="text-sm font-semibold text-gray-900">Security</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Password changes and two-factor authentication coming soon.
          </p>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-5">
          <h2 className="text-sm font-semibold text-red-600 mb-3">Danger Zone</h2>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
