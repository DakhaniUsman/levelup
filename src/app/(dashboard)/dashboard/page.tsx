"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Shield,
  Zap,
  Swords,
  CheckSquare,
  ArrowRight,
  TrendingUp,
  Plus,
  Loader2,
  Dumbbell,
  Receipt,
  IndianRupee,
  Scale,
  Wallet,
} from "lucide-react";
import { PopulatedOccurrence } from "@/features/quests/services/quest.service";
import { ITask } from "@/models/Task";
import { IQuest } from "@/models/Quest";
import { IWorkout } from "@/models/Workout";
import { IDailyProtocol } from "@/models/DailyProtocol";
import QuestCard from "@/features/quests/components/QuestCard";
import TaskModal from "@/features/tasks/components/TaskModal";
import CreateQuestModal from "@/features/quests/components/CreateQuestModal";
import BookmarkModal from "@/features/knowledge/components/BookmarkModal";
import PenaltyZoneBanner from "@/features/protocol/components/PenaltyZoneBanner";
import LivingSpheresBoard from "@/features/protocol/components/LivingSpheresBoard";
import SystemJudgementModal from "@/features/protocol/components/SystemJudgementModal";
import ExpenseModal from "@/features/expenses/components/ExpenseModal";
import WorkoutLoggerModal from "@/features/workouts/components/WorkoutLoggerModal";
import WorkoutHistoryModal from "@/features/workouts/components/WorkoutHistoryModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

interface DashboardData {
  profile: {
    displayName: string;
    timezone: string;
  };
  progression: {
    level: number;
    currentLevelXP: number;
    xpRequiredForNextLevel: number;
    progressPercent: number;
    totalLifetimeXP: number;
    todayXP: number;
    rank: {
      name: string;
      title: string;
      colorHex: string;
      code?: string;
    };
  };
  dailyPerformance: {
    totalQuests: number;
    completedQuests: number;
    pendingQuests: number;
    dailyCompletionRate: number;
    todayXP: number;
  };
  todayQuests: PopulatedOccurrence[];
  recentTasks: ITask[];
  categories: {
    category: string;
    total: number;
    completed: number;
    percent: number;
  }[];
  fitnessSummary?: {
    latestWorkout: { title: string; split: string; date: string } | null;
    weeklyWorkoutCount: number;
    totalVolumeThisMonth: number;
    totalPRs: number;
    currentWeight: number;
    targetWeight: number;
    progressPercent: number;
  };
  financeSummary?: {
    month: string;
    income: number;
    expenses: number;
    netSavings: number;
    savingsRate: number;
    remainingBudget: number;
    budgetUtilization: number;
    highestCategory: string | null;
  };
}

const DEFAULT_CATEGORIES = [
  { name: "FITNESS", label: "Physical Development", color: "#FF2A55" },
  { name: "CAREER", label: "Career & Projects", color: "#0088FF" },
  { name: "LEARNING", label: "Technical Mastery", color: "#00F0FF" },
  { name: "SPIRITUAL", label: "Spiritual Discipline", color: "#8A2BE2" },
  { name: "FINANCE", label: "Financial Growth", color: "#10B981" },
  { name: "PERSONAL", label: "Discipline & Habits", color: "#F59E0B" },
];

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ITask | null>(null);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [questToEdit, setQuestToEdit] = useState<IQuest | null>(null);
  const [questToDelete, setQuestToDelete] = useState<IQuest | null>(null);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isWorkoutHistoryOpen, setIsWorkoutHistoryOpen] = useState(false);
  const [workoutToEdit, setWorkoutToEdit] = useState<IWorkout | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isJudgementModalOpen, setIsJudgementModalOpen] = useState(false);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    },
    refetchInterval: 15000,
  });

  const { data: protocol } = useQuery<IDailyProtocol>({
    queryKey: ["daily-protocol"],
    queryFn: async () => {
      const res = await fetch("/api/protocol");
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ?? null;
    },
    refetchInterval: 15000,
  });

  const completeQuestMutation = useMutation({
    mutationFn: async (occurrenceId: string) => {
      const res = await fetch(`/api/quests/occurrences/${occurrenceId}/complete`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
    },
  });

  const deleteQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const res = await fetch(`/api/quests/${questId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to delete quest");
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
      queryClient.invalidateQueries({ queryKey: ["today-quests"] });
      setQuestToDelete(null);
    },
  });

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-[#64748B] font-mono text-xs gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#00F0FF]" />
        <span>INITIALIZING HUNTER COMMAND CENTER HUD...</span>
      </div>
    );
  }

  const p = data?.progression;
  const d = data?.dailyPerformance;
  const rank = p?.rank;

  return (
    <div className="space-y-8">
      {/* 0. Solo Leveling Emergency Penalty Banner (if active) */}
      {protocol && (
        <PenaltyZoneBanner
          penalty={protocol.penalty}
          inPenaltyZone={protocol.inPenaltyZone}
        />
      )}

      {/* 7.1 Hunter Profile HUD Banner */}
      <div className="hud-card p-6 sm:p-8 rounded-2xl border border-[#1F2435] relative overflow-hidden">
        {/* Holographic background line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0 transition-all bg-[#131620] relative group"
              style={{
                borderColor: rank?.colorHex && rank.name !== "E-Rank" ? `${rank.colorHex}70` : "rgba(0, 240, 255, 0.5)",
                backgroundColor: rank?.colorHex && rank.name !== "E-Rank" ? `${rank.colorHex}18` : "rgba(0, 240, 255, 0.1)",
                boxShadow: rank?.colorHex && rank.name !== "E-Rank"
                  ? `0 0 20px ${rank.colorHex}35`
                  : "0 0 20px rgba(0, 240, 255, 0.25)",
              }}
            >
              <Shield
                className="w-8 h-8 transition-transform duration-300 group-hover:scale-110"
                style={{
                  color: rank?.colorHex && rank.name !== "E-Rank" ? rank.colorHex : "#00F0FF",
                  filter: `drop-shadow(0 0 10px ${rank?.colorHex && rank.name !== "E-Rank" ? rank.colorHex : "#00F0FF"})`,
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-mono tracking-tight text-white">
                  {data?.profile.displayName}
                </h1>
                <span
                  className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border"
                  style={{
                    borderColor: `${rank?.colorHex}50`,
                    color: rank?.colorHex,
                  }}
                >
                  {rank?.name} ({rank?.title})
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono mt-1">
                Total Lifetime: {p?.totalLifetimeXP.toLocaleString()} XP // System Awakened
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#131620] border border-[#1F2435] hover:border-[#00F0FF]/40 text-xs font-mono text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Directive</span>
            </button>
            <button
              onClick={() => setIsQuestModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#131620] border border-[#1F2435] hover:border-[#00F0FF]/40 text-xs font-mono text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#0088FF]" />
              <span>Quest</span>
            </button>
            <button
              onClick={() => setIsWorkoutHistoryOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-950/30 border border-rose-900/60 hover:border-rose-500 text-xs font-mono text-rose-300 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Dumbbell className="w-3.5 h-3.5 text-rose-400" />
              <span>Workout</span>
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-900/60 hover:border-emerald-500 text-xs font-mono text-emerald-300 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              <span>Expense</span>
            </button>
            <button
              onClick={() => setIsBookmarkModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#131620] border border-[#1F2435] hover:border-[#00F0FF]/40 text-xs font-mono text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#8A2BE2]" />
              <span>Archive</span>
            </button>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-6 pt-6 border-t border-[#1F2435]/60 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-white font-bold">
              Level {p?.level} Progress (Next: Level {(p?.level || 1) + 1})
            </span>
            <span className="text-[#00F0FF] font-bold">
              {p?.currentLevelXP} / {p?.xpRequiredForNextLevel} XP (
              {p?.progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-[#090A0F] h-3 rounded-full overflow-hidden border border-[#1F2435] p-0.5">
            <div
              className="bg-gradient-to-r from-[#0088FF] to-[#00F0FF] h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(0,240,255,0.6)]"
              style={{ width: `${p?.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 7.2 Daily Performance Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hud-card p-5 rounded-xl border border-[#1F2435]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">
            DAILY XP HARVEST
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1">
            <Zap className="w-5 h-5 fill-emerald-400" />
            <span>+{d?.todayXP} XP</span>
          </div>
          <p className="text-[10px] text-[#94A3B8] font-mono mt-1">
            Earned today
          </p>
        </div>

        <div className="hud-card p-5 rounded-xl border border-[#1F2435]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">
            DAILY CLEAR RATE
          </span>
          <div className="text-2xl font-bold font-mono text-[#00F0FF] mt-1">
            {d?.dailyCompletionRate}%
          </div>
          <p className="text-[10px] text-[#94A3B8] font-mono mt-1">
            {d?.completedQuests} of {d?.totalQuests} quests
          </p>
        </div>

        <div className="hud-card p-5 rounded-xl border border-[#1F2435]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">
            PENDING TRIALS
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {d?.pendingQuests}
          </div>
          <p className="text-[10px] text-[#94A3B8] font-mono mt-1">
            Requires completion
          </p>
        </div>

        <div className="hud-card p-5 rounded-xl border border-[#1F2435]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#64748B]">
            CURRENT RANK
          </span>
          <div
            className="text-2xl font-bold font-mono mt-1"
            style={{ color: rank?.colorHex }}
          >
            {rank?.name}
          </div>
          <p className="text-[10px] text-[#94A3B8] font-mono mt-1">
            {rank?.title}
          </p>
        </div>
      </div>

      {/* 7.3 PHASE 3: 5-Sphere Living Protocol HUD */}
      <LivingSpheresBoard
        protocol={protocol || null}
        onOpenWorkoutModal={() => setIsWorkoutModalOpen(true)}
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        onOpenJudgementModal={() => setIsJudgementModalOpen(true)}
      />

      {/* 7.35 FITNESS & FINANCIAL COMMAND INTELLIGENCE WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        {/* Fitness & Transformation Summary Card */}
        <div className="hud-card p-6 rounded-2xl border border-rose-900/40 bg-[#131620]/60 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2435]">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-rose-400" />
              <h2 className="font-bold text-white uppercase tracking-wider">
                FITNESS & TRANSFORMATION
              </h2>
            </div>
            <Link
              href="/fitness"
              className="text-[#00F0FF] hover:underline flex items-center gap-1 font-bold text-[11px]"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1F2435]">
              <span className="text-[10px] text-[#64748B] block">WEEKLY FREQUENCY</span>
              <span className="text-xl font-bold text-white">
                {data?.fitnessSummary?.weeklyWorkoutCount || 0}
              </span>
              <span className="text-[10px] text-[#94A3B8] block">sessions / week</span>
            </div>

            <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1F2435]">
              <span className="text-[10px] text-[#64748B] block">BODY WEIGHT GOAL</span>
              <span className="text-xl font-bold text-emerald-400">
                {data?.fitnessSummary?.currentWeight || 51}{" "}
                <span className="text-xs text-[#94A3B8]">
                  &rarr; {data?.fitnessSummary?.targetWeight || 65} kg
                </span>
              </span>
              <span className="text-[10px] text-[#00F0FF] block">
                {data?.fitnessSummary?.progressPercent || 0}% completed
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1F2435] flex items-center justify-between">
            <span className="text-[#94A3B8]">Latest Session:</span>
            <span className="text-white font-bold truncate max-w-[200px]">
              {data?.fitnessSummary?.latestWorkout
                ? `${data.fitnessSummary.latestWorkout.title} [${data.fitnessSummary.latestWorkout.split}]`
                : "No workouts recorded yet"}
            </span>
          </div>
        </div>

        {/* Financial Intelligence Summary Card */}
        <div className="hud-card p-6 rounded-2xl border border-emerald-900/40 bg-[#131620]/60 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2435]">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-white uppercase tracking-wider">
                FINANCIAL INTELLIGENCE ({data?.financeSummary?.month || "Current"})
              </h2>
            </div>
            <Link
              href="/finance"
              className="text-[#00F0FF] hover:underline flex items-center gap-1 font-bold text-[11px]"
            >
              <span>Full Intel</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1F2435]">
              <span className="text-[10px] text-[#64748B] block">NET SAVINGS</span>
              <span
                className={`text-xl font-bold ${
                  (data?.financeSummary?.netSavings || 0) >= 0
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                ₹{(data?.financeSummary?.netSavings || 0).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-[#94A3B8] block">
                Rate: {data?.financeSummary?.savingsRate || 0}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1F2435]">
              <span className="text-[10px] text-[#64748B] block">BUDGET REMAINING</span>
              <span className="text-xl font-bold text-[#00F0FF]">
                ₹{(data?.financeSummary?.remainingBudget || 0).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-[#64748B] block">
                {data?.financeSummary?.budgetUtilization || 0}% used
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1F2435] flex items-center justify-between">
            <span className="text-[#94A3B8]">Primary Drain:</span>
            <span className="text-white font-bold truncate max-w-[200px]">
              {data?.financeSummary?.highestCategory
                ? data.financeSummary.highestCategory
                : "No expenditures logged yet"}
            </span>
          </div>
        </div>
      </div>

      {/* 7.4 Life Categories HUD Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
            <span>LIFE SPHERE PROGRESSION</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DEFAULT_CATEGORIES.map((cat) => {
            const found = data?.categories.find((c) => c.category === cat.name);
            const percent = found ? found.percent : 0;
            const completed = found ? found.completed : 0;
            const total = found ? found.total : 0;

            return (
              <div
                key={cat.name}
                className="hud-card p-4 rounded-xl border border-[#1F2435] space-y-2"
              >
                <div className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase truncate">
                  {cat.label}
                </div>
                <div
                  className="text-lg font-bold font-mono"
                  style={{ color: cat.color }}
                >
                  {percent}%
                </div>
                <div className="w-full bg-[#090A0F] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
                <div className="text-[9px] font-mono text-[#64748B]">
                  {completed}/{total} Directives
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7.5 Today's Quests & Active Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Quests Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-[#00F0FF]" />
              <span>TODAY&apos;S QUESTS</span>
            </h2>
            <Link
              href="/quests"
              className="text-xs font-mono text-[#00F0FF] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!data?.todayQuests || data.todayQuests.length === 0 ? (
            <div className="hud-card p-8 text-center rounded-xl border border-[#1F2435] font-mono text-xs text-[#94A3B8] space-y-2">
              <p>No active daily quests assigned for today.</p>
              <button
                onClick={() => setIsQuestModalOpen(true)}
                className="text-[#00F0FF] hover:underline"
              >
                Initialize your first quest trial
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.todayQuests.map((occ) => (
                <QuestCard
                  key={occ._id.toString()}
                  occurrence={occ}
                  onComplete={(id) => completeQuestMutation.mutate(id)}
                  onEdit={(quest) => {
                    setQuestToEdit(quest);
                    setIsQuestModalOpen(true);
                  }}
                  onDelete={(quest) => {
                    setQuestToDelete(quest);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tactical Directives Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#0088FF]" />
              <span>TACTICAL DIRECTIVES</span>
            </h2>
            <Link
              href="/tasks"
              className="text-xs font-mono text-[#0088FF] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!data?.recentTasks || data.recentTasks.length === 0 ? (
            <div className="hud-card p-8 text-center rounded-xl border border-[#1F2435] font-mono text-xs text-[#94A3B8] space-y-2">
              <p>No pending tactical directives in backlog.</p>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="text-[#0088FF] hover:underline"
              >
                Create a directive
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentTasks.map((t) => (
                <div
                  key={t._id.toString()}
                  className="hud-card p-4 rounded-xl border border-[#1F2435] hover:border-[#0088FF]/40 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#090A0F] border border-[#1F2435] text-[#94A3B8]">
                      {t.category}
                    </span>
                    <h4 className="text-sm font-semibold font-mono text-white mt-1.5">
                      {t.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTaskToEdit(t);
                        setIsTaskModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-[#131620] border border-[#1F2435] hover:border-[#0088FF]/50 text-[#64748B] hover:text-[#0088FF] transition-all cursor-pointer"
                      title="Edit Directive"
                    >
                      <Plus className="w-3.5 h-3.5 rotate-45" />
                    </button>
                    <button
                      onClick={() => completeTaskMutation.mutate(t._id.toString())}
                      className="px-3 py-1.5 rounded-lg bg-[#131620] border border-[#1F2435] hover:border-emerald-500 hover:text-emerald-400 text-xs font-mono transition-all text-[#94A3B8] cursor-pointer"
                    >
                      Done (+{t.xpReward} XP)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        taskToEdit={taskToEdit}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }}
      />
      <CreateQuestModal
        isOpen={isQuestModalOpen}
        questToEdit={questToEdit}
        onClose={() => {
          setIsQuestModalOpen(false);
          setQuestToEdit(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["today-quests"] });
        }}
      />
      <ConfirmDeleteModal
        isOpen={!!questToDelete}
        onClose={() => setQuestToDelete(null)}
        onConfirm={() => {
          if (questToDelete) {
            deleteQuestMutation.mutate(questToDelete._id.toString());
          }
        }}
        title="DELETE QUEST TRIAL"
        itemName={questToDelete?.title || "Daily Quest"}
        description="Are you sure you want to deactivate and remove this recurring trial?"
        warningText="Past completed trials and earned XP remain permanently recorded in your ledger. Future pending occurrences will be cleared."
        isPending={deleteQuestMutation.isPending}
      />
      <BookmarkModal
        isOpen={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        }}
      />
      <WorkoutLoggerModal
        isOpen={isWorkoutModalOpen}
        workoutToEdit={workoutToEdit}
        onClose={() => {
          setIsWorkoutModalOpen(false);
          setWorkoutToEdit(null);
        }}
      />
      <WorkoutHistoryModal
        isOpen={isWorkoutHistoryOpen}
        onClose={() => setIsWorkoutHistoryOpen(false)}
        onEditWorkout={(w) => {
          setWorkoutToEdit(w);
          setIsWorkoutModalOpen(true);
        }}
        onLogNewWorkout={() => {
          setWorkoutToEdit(null);
          setIsWorkoutModalOpen(true);
        }}
      />
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
      <SystemJudgementModal
        isOpen={isJudgementModalOpen}
        onClose={() => setIsJudgementModalOpen(false)}
        todayXP={d?.todayXP || 0}
      />
    </div>
  );
}
