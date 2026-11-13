"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Save, Loader2, CheckCircle2 } from "lucide-react";
import { SafeUser } from "@/features/auth/services/auth.service";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [successMsg, setSuccessMsg] = useState(false);

  const { data: user, isLoading } = useQuery<SafeUser>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      return json.data;
    },
  });

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.username || "");
      setBio(user.bio || "");
      setTimezone(user.timezone || "UTC");
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      displayName: string;
      bio: string;
      timezone: string;
    }) => {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ displayName, bio, timezone });
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center text-[#00F0FF]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#1F2435]">
        <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#00F0FF]" />
          HUNTER PROFILE SETTINGS
        </h1>
        <p className="text-xs text-[#94A3B8] font-mono mt-1">
          Manage your Hunter identification, bio, and system time synchronization
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile configuration updated successfully.</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="hud-card p-6 sm:p-8 rounded-2xl border border-[#1F2435] space-y-6 font-mono text-xs"
      >
        <div>
          <label className="block uppercase text-[#94A3B8] tracking-wider mb-2">
            Hunter Codename (Immutable)
          </label>
          <input
            type="text"
            disabled
            value={user?.username || ""}
            className="w-full px-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-[#64748B] cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block uppercase text-[#94A3B8] tracking-wider mb-2">
            Display Name
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
          />
        </div>

        <div>
          <label className="block uppercase text-[#94A3B8] tracking-wider mb-2">
            System Bio / Personal Philosophy
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Become 1% better every day..."
            className="w-full px-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#00F0FF] focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="block uppercase text-[#94A3B8] tracking-wider mb-2">
            System Timezone (Crucial for Daily Quest Reset)
          </label>
          <input
            type="text"
            required
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
          />
          <p className="text-[10px] text-[#64748B] mt-1.5">
            Standard IANA timezone string (e.g. America/New_York, Asia/Kolkata, UTC)
          </p>
        </div>

        <div className="pt-4 border-t border-[#1F2435] flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 rounded-lg bg-[#00F0FF] text-[#090A0F] font-bold hover:bg-[#00F0FF]/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>SAVE CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
}

