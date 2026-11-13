"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  BookOpen,
  Dumbbell,
  Heart,
  CheckCircle2,
  Circle,
  Skull,
  Receipt,
  Flame,
  Moon,
  Check,
} from "lucide-react";
import { IDailyProtocol } from "@/models/DailyProtocol";

interface LivingSpheresBoardProps {
  protocol: IDailyProtocol | null;
  onOpenWorkoutModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenJudgementModal: () => void;
}

export default function LivingSpheresBoard({
  protocol,
  onOpenWorkoutModal,
  onOpenExpenseModal,
  onOpenJudgementModal,
}: LivingSpheresBoardProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (patchData: any) => {
      const res = await fetch("/api/protocol", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchData),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
    },
  });

  if (!protocol) return null;

  const score = protocol.overallScore || 0;
  const isTransgressed = protocol.isTransgressed;

  // Toggle helper
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleToggle = (path: string, currentVal: boolean) => {
    const parts = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {};
    if (parts.length === 2) {
      payload[parts[0]] = { [parts[1]]: !currentVal };
    } else if (parts.length === 3) {
      payload[parts[0]] = {
        [parts[1]]: { [parts[2]]: !currentVal },
      };
    }
    updateMutation.mutate(payload);
  };

  // Prayers completed count
  const prayers = protocol.spirituality?.prayers || {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  };
  const prayerCount = Object.values(prayers).filter(Boolean).length;

  return (
    <div className="space-y-4 font-mono">
      {/* Protocol Banner Header */}
      <div className="hud-card p-4 sm:p-5 rounded-2xl border border-[#1F2435] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
              5-Sphere Protocol
            </span>
            {isTransgressed && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/50 flex items-center gap-1">
                <Skull className="w-3 h-3" /> Transgressed
              </span>
            )}
            {score === 100 && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center gap-1">
                <Check className="w-3 h-3" /> 100% S-Rank Cleared
              </span>
            )}
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
            1% BETTER EVERY DAY — LIVING SYSTEM
          </h2>
          <p className="text-[11px] sm:text-xs text-[#94A3B8]">
            Master your routine across Spirituality, Mental, Physical, Emotional &amp; Financial growth.
          </p>
        </div>

        {/* Score & System Judgement Button */}
        <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1F2435]">
          <div className="text-left md:text-right">
            <div className="text-[9px] sm:text-[10px] text-[#64748B] uppercase tracking-wider">
              PROTOCOL COMPLETION
            </div>
            <div
              className={`text-xl sm:text-2xl font-black ${
                isTransgressed
                  ? "text-rose-500 line-through"
                  : score >= 70
                  ? "text-emerald-400"
                  : "text-[#00F0FF]"
              }`}
            >
              {score}%
            </div>
          </div>

          <div className="h-8 w-px bg-[#1F2435]" />

          <button
            onClick={onOpenJudgementModal}
            title="Declare Sin / Broken Vow (Purges today's XP and resets streaks)"
            className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 hover:border-rose-600 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.2)]"
          >
            <Skull className="w-4 h-4 text-rose-500" />
            <span>System Judgement</span>
          </button>
        </div>
      </div>

      {/* 5-Sphere Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. SPIRITUALITY SPHERE */}
        <div className="hud-card p-4 rounded-xl border border-[#1F2435] hover:border-purple-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between border-b border-[#1F2435] pb-2.5">
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                SPIRITUALITY
              </h3>
            </div>
            <span className="text-[10px] text-purple-300 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
              {prayerCount}/5 Prayers
            </span>
          </div>

          {/* 5 Daily Prayers Pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-[#94A3B8] uppercase block">
              5 Daily Prayers:
            </span>
            <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
              {(
                [
                  { key: "fajr", label: "Fajr" },
                  { key: "dhuhr", label: "Dhuhr" },
                  { key: "asr", label: "Asr" },
                  { key: "maghrib", label: "Magh" },
                  { key: "isha", label: "Isha" },
                ] as const
              ).map(({ key, label }) => {
                const isDone = prayers[key];
                return (
                  <button
                    key={key}
                    onClick={() =>
                      handleToggle(`spirituality.prayers.${key}`, isDone)
                    }
                    className={`py-1.5 text-center text-[10px] rounded border transition-all cursor-pointer ${
                      isDone
                        ? "bg-purple-600/25 border-purple-500 text-purple-200 font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]"
                        : "bg-[#090A0F] border-[#1F2435] text-[#64748B] hover:text-[#94A3B8]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quran & Arabic Checkboxes */}
          <div className="space-y-2 pt-1 border-t border-[#181B26]">
            <label
              onClick={() =>
                handleToggle(
                  "spirituality.quran",
                  protocol.spirituality?.quran || false
                )
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-1"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Quran Recitation</span>
              </span>
              {protocol.spirituality?.quran ? (
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>

            <label
              onClick={() =>
                handleToggle(
                  "spirituality.arabic",
                  protocol.spirituality?.arabic || false
                )
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-1"
            >
              <span className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-400 font-serif">
                  ع
                </span>
                <span>Learning Arabic</span>
              </span>
              {protocol.spirituality?.arabic ? (
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>
          </div>
        </div>

        {/* 2. MENTAL SPHERE */}
        <div className="hud-card p-4 rounded-xl border border-[#1F2435] hover:border-[#00F0FF]/40 transition-all space-y-3">
          <div className="flex items-center justify-between border-b border-[#1F2435] pb-2.5">
            <div className="flex items-center gap-2 text-[#00F0FF]">
              <BookOpen className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                MENTAL DISCIPLINE
              </h3>
            </div>
            <span className="text-[10px] text-[#00F0FF] font-bold bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/30">
              Strategy &amp; Study
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            <label
              onClick={() =>
                handleToggle(
                  "mentally.dayPlanning",
                  protocol.mentally?.dayPlanning || false
                )
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-1 border-b border-[#181B26]"
            >
              <div>
                <div className="font-medium">Day Planning &amp; Strategy</div>
                <div className="text-[10px] text-[#64748B]">
                  Framed priorities before 10:30 AM
                </div>
              </div>
              {protocol.mentally?.dayPlanning ? (
                <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>

            <label
              onClick={() =>
                handleToggle("mentally.reading", protocol.mentally?.reading || false)
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-1 border-b border-[#181B26]"
            >
              <div>
                <div className="font-medium">Read 10 Pages</div>
                <div className="text-[10px] text-[#64748B]">
                  Book, philosophy, or technical text
                </div>
              </div>
              {protocol.mentally?.reading ? (
                <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>

            <label
              onClick={() =>
                handleToggle(
                  "mentally.selfLearning",
                  protocol.mentally?.selfLearning || false
                )
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-1"
            >
              <div>
                <div className="font-medium">Self-Learning &amp; Research</div>
                <div className="text-[10px] text-[#64748B]">
                  Coding practice or business growth
                </div>
              </div>
              {protocol.mentally?.selfLearning ? (
                <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>
          </div>
        </div>

        {/* 3. PHYSICAL SPHERE */}
        <div className="hud-card p-4 rounded-xl border border-[#1F2435] hover:border-rose-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between border-b border-[#1F2435] pb-2.5">
            <div className="flex items-center gap-2 text-rose-400">
              <Dumbbell className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                PHYSICAL HEALTH
              </h3>
            </div>
            <button
              onClick={onOpenWorkoutModal}
              className="text-[10px] text-rose-400 font-bold bg-rose-950/40 hover:bg-rose-900/60 px-2.5 py-0.5 rounded border border-rose-800/40 cursor-pointer flex items-center gap-1"
            >
              <span>+ Log Gym</span>
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <label
              onClick={() =>
                handleToggle(
                  "physically.morningWorkout",
                  protocol.physically?.morningWorkout || false
                )
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-0.5"
            >
              <span>Morning Light Workout &amp; Walk</span>
              {protocol.physically?.morningWorkout ? (
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>

            <label
              onClick={() =>
                handleToggle(
                  "physically.healthyBreakfast",
                  protocol.physically?.healthyBreakfast || false
                )
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-0.5"
            >
              <span>Nutritious Breakfast</span>
              {protocol.physically?.healthyBreakfast ? (
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>

            <label
              onClick={() =>
                handleToggle(
                  "physically.healthyLunch",
                  protocol.physically?.healthyLunch || false
                )
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-0.5"
            >
              <span>Healthy Lunch (2:00 PM)</span>
              {protocol.physically?.healthyLunch ? (
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>

            <label
              onClick={() =>
                handleToggle(
                  "physically.gymWorkout",
                  protocol.physically?.gymWorkout || false
                )
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-0.5"
            >
              <span className="flex items-center gap-1">
                <span>Evening Gym (7:30-8:00 PM)</span>
                <Flame className="w-3 h-3 text-rose-500" />
              </span>
              {protocol.physically?.gymWorkout ? (
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>

            <label
              onClick={() =>
                handleToggle(
                  "physically.sleepTarget",
                  protocol.physically?.sleepTarget || false
                )
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-0.5"
            >
              <span className="flex items-center gap-1">
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>Sleep 7-9h (In bed by 11 PM)</span>
              </span>
              {protocol.physically?.sleepTarget ? (
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>
          </div>
        </div>

        {/* 4. EMOTIONAL SPHERE */}
        <div className="hud-card p-4 rounded-xl border border-[#1F2435] hover:border-pink-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between border-b border-[#1F2435] pb-2.5">
            <div className="flex items-center gap-2 text-pink-400">
              <Heart className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                EMOTIONAL HARMONY
              </h3>
            </div>
            <span className="text-[10px] text-pink-300 font-bold bg-pink-950/40 px-2 py-0.5 rounded border border-pink-800/40">
              Presence &amp; Bond
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            <label
              onClick={() =>
                handleToggle(
                  "emotionally.mentalPreparedness",
                  protocol.emotionally?.mentalPreparedness || false
                )
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-1 border-b border-[#181B26]"
            >
              <div>
                <div className="font-medium">Emotional Preparedness</div>
                <div className="text-[10px] text-[#64748B]">
                  Calm responses to daily scenarios
                </div>
              </div>
              {protocol.emotionally?.mentalPreparedness ? (
                <CheckCircle2 className="w-4 h-4 text-pink-400" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>

            <label
              onClick={() =>
                handleToggle(
                  "emotionally.mushfaTime",
                  protocol.emotionally?.mushfaTime || false
                )
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-1 border-b border-[#181B26]"
            >
              <div>
                <div className="font-medium text-pink-300">
                  Focus &amp; Planning for Mushfa
                </div>
                <div className="text-[10px] text-[#64748B]">
                  Dedicated loving focus &amp; future plans
                </div>
              </div>
              {protocol.emotionally?.mushfaTime ? (
                <CheckCircle2 className="w-4 h-4 text-pink-400" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>

            <label
              onClick={() =>
                handleToggle(
                  "emotionally.familyTime",
                  protocol.emotionally?.familyTime || false
                )
              }
              className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-1"
            >
              <div>
                <div className="font-medium">Family &amp; Loved Ones</div>
                <div className="text-[10px] text-[#64748B]">
                  Quality conversation &amp; bonds
                </div>
              </div>
              {protocol.emotionally?.familyTime ? (
                <CheckCircle2 className="w-4 h-4 text-pink-400" />
              ) : (
                <Circle className="w-4 h-4 text-[#475569]" />
              )}
            </label>
          </div>
        </div>

        {/* 5. FINANCIAL SPHERE */}
        <div className="hud-card p-4 rounded-xl border border-[#1F2435] hover:border-emerald-500/40 transition-all space-y-3 md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#1F2435] pb-2.5">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-5 h-5 rounded-md bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                ₹
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                FINANCIAL DISCIPLINE &amp; AUDIT
              </h3>
            </div>
            <button
              onClick={onOpenExpenseModal}
              className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 hover:bg-emerald-900/60 px-2.5 py-0.5 rounded border border-emerald-800/40 cursor-pointer flex items-center gap-1"
            >
              <Receipt className="w-3 h-3" />
              <span>Log Expense Audit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-center">
            <div className="bg-[#050608] p-3 rounded-lg border border-[#1F2435] space-y-1">
              <span className="text-[10px] text-[#94A3B8] uppercase block">
                Today&apos;s Total Spending
              </span>
              <div className="text-2xl font-bold text-emerald-400">
                ₹{protocol.financially?.totalSpentToday?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
              </div>
              <p className="text-[10px] text-[#64748B]">
                Tracked across Food, Commute, Outing, Misc
              </p>
            </div>

            <label
              onClick={() =>
                handleToggle(
                  "financially.auditCompleted",
                  protocol.financially?.auditCompleted || false
                )
              }
              className="flex items-center justify-between p-3 rounded-lg bg-[#050608] border border-[#1F2435] text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none"
            >
              <div>
                <div className="font-bold">End-of-Day Audit Completed</div>
                <div className="text-[10px] text-[#64748B]">
                  Logged and accounted for every rupee
                </div>
              </div>
              {protocol.financially?.auditCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Circle className="w-5 h-5 text-[#475569]" />
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
