"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, User as UserIcon, Globe, Loader2, AlertCircle } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState(
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC"
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          displayName: displayName || username,
          timezone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected registration error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="hud-card p-8 rounded-2xl border border-[#1F2435] shadow-2xl relative overflow-hidden">
        {/* Top holographic accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8A2BE2] to-transparent" />

        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-[#131620] border border-[#8A2BE2]/40 overflow-hidden shadow-[0_0_20px_rgba(138,43,226,0.25)] mb-3 items-center justify-center">
            <Image
              src="/swords.jpg"
              alt="LEVEL UP Swords"
              width={64}
              height={64}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
            HUNTER AWAKENING
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1 font-mono">
            Register your profile into the System ledger
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-[#FF2A55]/10 border border-[#FF2A55]/30 flex items-center gap-3 text-xs text-[#FF2A55] font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Hunter Codename (Username)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. shadow_monarch"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#8A2BE2] focus:outline-none focus:ring-1 focus:ring-[#8A2BE2] transition-all font-mono placeholder:text-[#64748B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Sung Jin-Woo"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#8A2BE2] focus:outline-none focus:ring-1 focus:ring-[#8A2BE2] transition-all font-mono placeholder:text-[#64748B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hunter@levelup.system"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#8A2BE2] focus:outline-none focus:ring-1 focus:ring-[#8A2BE2] transition-all font-mono placeholder:text-[#64748B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Access Key (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#8A2BE2] focus:outline-none focus:ring-1 focus:ring-[#8A2BE2] transition-all font-mono placeholder:text-[#64748B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#94A3B8] mb-1.5">
              System Timezone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#8A2BE2] focus:outline-none font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3 px-4 rounded-lg bg-[#8A2BE2] text-white font-mono font-semibold text-sm hover:bg-[#8A2BE2]/90 transition-all shadow-[0_0_20px_rgba(138,43,226,0.35)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AWAKENING SYSTEM...</span>
              </>
            ) : (
              <span>AWAKEN PROFILE</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#94A3B8] font-mono">
          <span>Already awakened? </span>
          <Link
            href="/login"
            className="text-[#8A2BE2] hover:underline font-semibold"
          >
            Authenticate here
          </Link>
        </div>
      </div>
    </div>
  );
}

