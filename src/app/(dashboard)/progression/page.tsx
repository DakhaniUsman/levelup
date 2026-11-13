"use client";

import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Award,
  Zap,
  Shield,
  Loader2,
  Calendar,
  Trophy,
  Lock,
  CheckCircle2,
  Flame,
  Crown,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { ProgressionStats } from "@/features/progression/services/xp.service";
import { RANKS } from "@/features/progression/constants/ranks";
import { AchievementWithStatus } from "@/features/achievements/services/achievement.service";
import { cn } from "@/lib/utils";

interface XPTransactionRecord {
  _id: string;
  amount: number;
  transactionType: string;
  sourceType: string;
  description: string;
  createdAt: string;
}

interface HistoryResponse {
  transactions: XPTransactionRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ACHIEVEMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Swords: Shield,
  Shield: Shield,
  Trophy: Trophy,
  Flame: Flame,
  Zap: Zap,
  Crown: Crown,
  BookOpen: BookOpen,
  Sparkles: Sparkles,
};

const RARITY_COLORS: Record<string, { border: string; text: string; bg: string }> = {
  COMMON: {
    border: "border-slate-700",
    text: "text-slate-400",
    bg: "bg-slate-900/40",
  },
  RARE: {
    border: "border-blue-500/40",
    text: "text-blue-400",
    bg: "bg-blue-950/20",
  },
  EPIC: {
    border: "border-purple-500/50",
    text: "text-purple-400",
    bg: "bg-purple-950/20",
  },
  LEGENDARY: {
    border: "border-amber-400/60",
    text: "text-amber-400",
    bg: "bg-amber-950/20",
  },
};

export default function ProgressionPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<ProgressionStats>({
    queryKey: ["progression-stats"],
    queryFn: async () => {
      const res = await fetch("/api/progression/stats");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: history, isLoading: historyLoading } = useQuery<HistoryResponse>({
    queryKey: ["progression-history"],
    queryFn: async () => {
      const res = await fetch("/api/progression/history?limit=25");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<
    AchievementWithStatus[]
  >({
    queryKey: ["achievements"],
    queryFn: async () => {
      // Auto-scan for achievements on view
      fetch("/api/achievements/check", { method: "POST" }).catch(() => {});
      const res = await fetch("/api/achievements");
      const json = await res.json();
      return json.data || [];
    },
  });

  const currentLevel = stats?.level || 1;
  const currentRankCode = stats?.rank?.code || "E";

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="pb-4 border-b border-[#1F2435]">
        <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
          <TrendingUp className="w-6 h-6 text-[#00F0FF]" />
          PROGRESSION & AUDIT LEDGER
        </h1>
        <p className="text-xs text-[#94A3B8] font-mono mt-1">
          Cryptographically auditable XP transaction ledger and Hunter Rank path
        </p>
      </div>

      {/* Main HUD Stats Card */}
      {statsLoading ? (
        <div className="py-12 flex justify-center text-[#00F0FF]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="hud-card p-6 sm:p-8 rounded-2xl border border-[#00F0FF]/30 shadow-[0_0_20px_rgba(0,240,255,0.08)] relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {/* Rank info */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">
                HUNTER RANK
              </span>
              <div
                className="text-3xl font-extrabold font-mono flex items-center gap-2"
                style={{ color: stats?.rank?.colorHex }}
              >
                <Award className="w-7 h-7" />
                <span>{stats?.rank?.name}</span>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono">
                {stats?.rank?.title}
              </p>
            </div>

            {/* Current Level */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">
                CURRENT LEVEL
              </span>
              <div className="text-3xl font-extrabold font-mono text-white">
                LVL <span className="text-[#00F0FF]">{currentLevel}</span>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono">
                {stats?.currentLevelXP} / {stats?.xpRequiredForNextLevel} XP to Lvl{" "}
                {currentLevel + 1}
              </p>
            </div>

            {/* Lifetime XP */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">
                LIFETIME EARNED XP
              </span>
              <div className="text-3xl font-extrabold font-mono text-amber-400 flex items-center gap-1.5">
                <Zap className="w-6 h-6 fill-amber-400" />
                <span>{stats?.totalLifetimeXP.toLocaleString()}</span>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono">
                Across {stats?.totalTransactions} transactions
              </p>
            </div>

            {/* Daily XP */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">
                TODAY'S GAIN
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                +{stats?.todayXP} XP
              </div>
              <p className="text-xs text-[#94A3B8] font-mono">
                Daily streak active
              </p>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mt-8 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#94A3B8]">
                Progress to Level {currentLevel + 1}
              </span>
              <span className="text-[#00F0FF] font-bold">
                {stats?.progressPercent}%
              </span>
            </div>
            <div className="w-full bg-[#090A0F] h-3 rounded-full overflow-hidden border border-[#1F2435] p-0.5">
              <div
                className="bg-gradient-to-r from-[#0088FF] to-[#00F0FF] h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(0,240,255,0.6)]"
                style={{ width: `${stats?.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Hunter Rank Path Overview */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00F0FF]" />
          <span>RANK ADVANCEMENT LADDER</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          {RANKS.map((r) => {
            const isCurrentRank = r.code === currentRankCode;
            const isUnlocked = currentLevel >= r.minLevel;

            return (
              <div
                key={r.code}
                className={cn(
                  "hud-card p-4 rounded-xl border text-center space-y-2 transition-all relative overflow-hidden",
                  isCurrentRank
                    ? "border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)] bg-[#131620]"
                    : isUnlocked
                    ? "border-[#1F2435] bg-[#131620]/60"
                    : "border-[#1F2435]/40 opacity-40 bg-[#090A0F]"
                )}
              >
                {isCurrentRank && (
                  <div className="absolute top-1 right-1 text-[8px] px-1 py-0.5 rounded bg-[#00F0FF] text-[#090A0F] font-bold">
                    ACTIVE
                  </div>
                )}
                <div
                  className="text-lg font-bold"
                  style={{ color: r.colorHex }}
                >
                  {r.name}
                </div>
                <div className="text-[10px] text-white font-semibold">
                  {r.title}
                </div>
                <div className="text-[10px] text-[#64748B]">
                  Lvl {r.minLevel} - {r.maxLevel === 999 ? "∞" : r.maxLevel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hunter Achievements Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>HUNTER ACHIEVEMENTS ({unlockedCount}/{achievements.length})</span>
          </h2>
        </div>

        {achievementsLoading ? (
          <div className="py-8 flex justify-center text-[#00F0FF]">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((ach) => {
              const Icon = ACHIEVEMENT_ICONS[ach.icon] || Trophy;
              const rarityStyle = RARITY_COLORS[ach.rarity] || RARITY_COLORS.COMMON;

              return (
                <div
                  key={ach._id.toString()}
                  className={cn(
                    "hud-card p-5 rounded-2xl border transition-all flex flex-col justify-between font-mono relative",
                    ach.isUnlocked
                      ? `${rarityStyle.border} ${rarityStyle.bg} shadow-[0_0_15px_rgba(0,240,255,0.06)]`
                      : "border-[#1F2435]/50 opacity-50 bg-[#090A0F]"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0",
                          ach.isUnlocked
                            ? `${rarityStyle.border} ${rarityStyle.text}`
                            : "border-[#1F2435] text-[#64748B]"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <span
                        className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                          rarityStyle.border,
                          rarityStyle.text
                        )}
                      >
                        {ach.rarity}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {ach.name}
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1 font-sans line-clamp-2">
                      {ach.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1F2435]/60 flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-amber-400" />
                      +{ach.xpReward} XP
                    </span>

                    {ach.isUnlocked ? (
                      <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="text-[#64748B] text-[10px] flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        LOCKED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction History Ledger */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
          <span>XP TRANSACTION LEDGER</span>
        </h2>

        {historyLoading ? (
          <div className="py-12 flex justify-center text-[#64748B] font-mono text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-[#00F0FF]" />
          </div>
        ) : !history?.transactions || history.transactions.length === 0 ? (
          <div className="hud-card p-8 text-center rounded-xl border border-[#1F2435] font-mono text-xs text-[#94A3B8]">
            No XP transactions recorded yet. Complete a task or daily quest to record your first transaction.
          </div>
        ) : (
          <div className="hud-card rounded-2xl border border-[#1F2435] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#090A0F] text-[#64748B] border-b border-[#1F2435]">
                  <tr>
                    <th className="py-3 px-4 uppercase">Timestamp</th>
                    <th className="py-3 px-4 uppercase">Source</th>
                    <th className="py-3 px-4 uppercase">Description</th>
                    <th className="py-3 px-4 uppercase text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2435]">
                  {history.transactions.map((tx) => (
                    <tr
                      key={tx._id}
                      className="hover:bg-[#131620]/60 transition-colors"
                    >
                      <td className="py-3 px-4 text-[#94A3B8] whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                          {new Date(tx.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-[#090A0F] border border-[#1F2435] text-[10px] text-[#00F0FF]">
                          {tx.sourceType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">
                        {tx.description}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400 whitespace-nowrap">
                        +{tx.amount} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
