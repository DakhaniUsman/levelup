import Link from "next/link";
import { Shield, Sparkles, Terminal, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00F0FF]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00F0FF]/30 bg-[#131620]/80 text-xs font-mono text-[#00F0FF] tracking-wider uppercase">
          <Terminal className="w-3.5 h-3.5" />
          <span>System Initialized // Hunter OS v2.0</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white font-mono">
            LEVEL <span className="text-[#00F0FF] hud-glow-cyan">UP</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#94A3B8] max-w-xl mx-auto font-sans leading-relaxed">
            Your life is your greatest project. Every day is an opportunity to level up.
            Become 1% better every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left font-mono">
          <div className="hud-card p-5 rounded-xl border border-[#1F2435]">
            <Shield className="w-6 h-6 text-[#00F0FF] mb-3" />
            <h2 className="text-sm font-semibold text-white">Daily Quests</h2>
            <p className="text-xs text-[#94A3B8] mt-1 font-sans">
              Structured progressive daily challenges with verifiable XP rewards.
            </p>
          </div>
          <div className="hud-card p-5 rounded-xl border border-[#1F2435]">
            <Sparkles className="w-6 h-6 text-[#8A2BE2] mb-3" />
            <h2 className="text-sm font-semibold text-white">Rank & Progression</h2>
            <p className="text-xs text-[#94A3B8] mt-1 font-sans">
              From E-Rank novice to S-Rank Sovereign. Real metrics, real growth.
            </p>
          </div>
          <div className="hud-card p-5 rounded-xl border border-[#1F2435]">
            <Terminal className="w-6 h-6 text-[#0088FF] mb-3" />
            <h2 className="text-sm font-semibold text-white">Task Engine</h2>
            <p className="text-xs text-[#94A3B8] mt-1 font-sans">
              Priority tracking, category management, and streak preservation.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#00F0FF] text-[#090A0F] font-semibold text-sm hover:bg-[#00F0FF]/90 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] font-mono"
          >
            <span>Enter The System</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#1F2435] bg-[#131620] text-[#F1F5F9] font-medium text-sm hover:border-[#00F0FF]/40 transition-all font-mono"
          >
            Create Hunter Profile
          </Link>
        </div>
      </div>
    </main>
  );
}

