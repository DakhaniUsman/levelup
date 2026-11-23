"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
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
  Check,
  Settings,
} from "lucide-react";
import { IDailyProtocol, IDailyActivityRecord } from "@/models/DailyProtocol";

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
  const activities = protocol.activities || [];

  const handleToggleDynamic = (itemId: string, currentVal: boolean) => {
    updateMutation.mutate({ itemId, isCompleted: !currentVal });
  };

  const handleTogglePrayer = (itemId: string, subKey: string, currentVal: boolean) => {
    updateMutation.mutate({ itemId, subKey, subValue: !currentVal });
  };

  const handleUpdateSteps = (itemId: string, currentSteps: number, delta: number) => {
    const updated = Math.max(0, currentSteps + delta);
    updateMutation.mutate({ itemId, stepsLogged: updated });
  };

  const getSphereActivities = (sphereName: string): IDailyActivityRecord[] => {
    return activities
      .filter((a) => a.sphere === sphereName)
      .sort((a, b) => a.order - b.order);
  };

  // Prayer counter helper
  const prayerActivity = activities.find((a) => a.type === "PRAYER_TRACKER");
  const prayers = prayerActivity?.subItems || protocol.spirituality?.prayers || {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  };
  const prayerCount = Object.values(prayers).filter(Boolean).length;

  const spiritualActs = getSphereActivities("SPIRITUALITY");
  const mentalActs = getSphereActivities("MENTAL");
  const physicalActs = getSphereActivities("PHYSICAL");
  const emotionalActs = getSphereActivities("EMOTIONAL");
  const financialActs = getSphereActivities("FINANCIAL");

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
            Master your daily routine across Spirituality, Mental, Physical, Emotional &amp; Financial growth.
          </p>
        </div>

        {/* Score & Controls */}
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

          {/* Quick Settings Shortcut */}
          <Link
            href="/settings/protocol"
            title="Configure Daily Protocol Activities"
            className="p-2 rounded-xl bg-[#131620] hover:bg-[#1F2435] border border-[#1F2435] hover:border-[#00F0FF]/40 text-[#94A3B8] hover:text-[#00F0FF] transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* System Judgement Button */}
          <button
            onClick={onOpenJudgementModal}
            title="Declare Sin / Broken Vow (Purges today's XP and resets streaks)"
            className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 hover:border-rose-600 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.2)]"
          >
            <Skull className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">System Judgement</span>
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
            {prayerActivity && (
              <span className="text-[10px] text-purple-300 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                {prayerCount}/5 Prayers
              </span>
            )}
          </div>

          <div className="space-y-2.5 pt-1">
            {spiritualActs.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#64748B]">
                No spiritual activities configured.
              </div>
            ) : (
              spiritualActs.map((act) => {
                if (act.type === "PRAYER_TRACKER") {
                  const pr = act.subItems || {
                    fajr: false,
                    dhuhr: false,
                    asr: false,
                    maghrib: false,
                    isha: false,
                  };
                  return (
                    <div key={act.itemId.toString()} className="space-y-1.5 pb-1">
                      <span className="text-[10px] text-[#94A3B8] uppercase block">
                        {act.title}:
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
                          const isDone = pr[key];
                          return (
                            <button
                              key={key}
                              onClick={() =>
                                handleTogglePrayer(act.itemId.toString(), key, !!isDone)
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
                  );
                }

                return (
                  <label
                    key={act.itemId.toString()}
                    onClick={() => handleToggleDynamic(act.itemId.toString(), act.isCompleted)}
                    className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-1 border-b border-[#181B26] last:border-0"
                  >
                    <div>
                      <div className="font-medium text-white">{act.title}</div>
                      {act.description && (
                        <div className="text-[10px] text-[#64748B]">{act.description}</div>
                      )}
                    </div>
                    {act.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#475569] shrink-0 ml-2" />
                    )}
                  </label>
                );
              })
            )}
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
              {mentalActs.filter((a) => a.isCompleted).length}/{mentalActs.length} Done
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {mentalActs.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#64748B]">
                No mental activities configured.
              </div>
            ) : (
              mentalActs.map((act) => (
                <label
                  key={act.itemId.toString()}
                  onClick={() => handleToggleDynamic(act.itemId.toString(), act.isCompleted)}
                  className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-1 border-b border-[#181B26] last:border-0"
                >
                  <div>
                    <div className="font-medium text-white">{act.title}</div>
                    {act.description && (
                      <div className="text-[10px] text-[#64748B]">{act.description}</div>
                    )}
                  </div>
                  {act.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0 ml-2" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#475569] shrink-0 ml-2" />
                  )}
                </label>
              ))
            )}
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
            {physicalActs.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#64748B]">
                No physical activities configured.
              </div>
            ) : (
              physicalActs.map((act) => {
                const isGym = act.type === "WORKOUT_LOG" || act.title.includes("Gym");

                if (act.type === "STEPS_TRACKER" || act.title.includes("Steps")) {
                  const currentSteps = act.metadata?.stepsLogged || 0;
                  const targetSteps = act.metadata?.stepsTarget || 5000;
                  const percent = Math.min(100, Math.round((currentSteps / targetSteps) * 100));

                  return (
                    <div
                      key={act.itemId.toString()}
                      className="p-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <div className="font-medium text-white flex items-center gap-1.5">
                            <span>{act.title}</span>
                            {act.isCompleted && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                          <div className="text-[10px] text-[#64748B]">
                            {currentSteps.toLocaleString()} / {targetSteps.toLocaleString()} steps ({percent}%)
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateSteps(act.itemId.toString(), currentSteps, 1000)}
                            className="px-2 py-0.5 text-[10px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all cursor-pointer font-bold"
                          >
                            +1k
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateSteps(act.itemId.toString(), currentSteps, 2500)}
                            className="px-2 py-0.5 text-[10px] rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all cursor-pointer font-bold"
                          >
                            +2.5k
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 w-full bg-[#131620] rounded-full overflow-hidden border border-[#1F2435]">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <label
                    key={act.itemId.toString()}
                    onClick={() => handleToggleDynamic(act.itemId.toString(), act.isCompleted)}
                    className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-1 border-b border-[#181B26] last:border-0"
                  >
                    <div>
                      <div className="font-medium text-white flex items-center gap-1.5">
                        <span>{act.title}</span>
                        {isGym && <Flame className="w-3 h-3 text-rose-500" />}
                      </div>
                      {act.description && (
                        <div className="text-[10px] text-[#64748B]">{act.description}</div>
                      )}
                    </div>
                    {act.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#475569] shrink-0 ml-2" />
                    )}
                  </label>
                );
              })
            )}
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
              {emotionalActs.filter((a) => a.isCompleted).length}/{emotionalActs.length} Done
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {emotionalActs.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#64748B]">
                No emotional activities configured.
              </div>
            ) : (
              emotionalActs.map((act) => (
                <label
                  key={act.itemId.toString()}
                  onClick={() => handleToggleDynamic(act.itemId.toString(), act.isCompleted)}
                  className="flex items-center justify-between text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none py-1 border-b border-[#181B26] last:border-0"
                >
                  <div>
                    <div className="font-medium text-white">{act.title}</div>
                    {act.description && (
                      <div className="text-[10px] text-[#64748B]">{act.description}</div>
                    )}
                  </div>
                  {act.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0 ml-2" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#475569] shrink-0 ml-2" />
                  )}
                </label>
              ))
            )}
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
            {/* Total Spending Aggregator */}
            <div className="bg-[#050608] p-3 rounded-lg border border-[#1F2435] space-y-1">
              <span className="text-[10px] text-[#94A3B8] uppercase block">
                Today&apos;s Total Spending
              </span>
              <div className="text-2xl font-bold text-emerald-400">
                ₹
                {protocol.financially?.totalSpentToday?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}
              </div>
              <p className="text-[10px] text-[#64748B]">
                Tracked across Food, Commute, Outing, Misc
              </p>
            </div>

            {/* Financial Activities Checkboxes */}
            <div className="space-y-2">
              {financialActs.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#64748B]">
                  No financial activities configured.
                </div>
              ) : (
                financialActs.map((act) => (
                  <label
                    key={act.itemId.toString()}
                    onClick={() => handleToggleDynamic(act.itemId.toString(), act.isCompleted)}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#050608] border border-[#1F2435] text-xs text-[#CBD5E1] hover:text-white cursor-pointer select-none"
                  >
                    <div>
                      <div className="font-bold text-white">{act.title}</div>
                      <div className="text-[10px] text-[#64748B]">
                        {act.description || "Logged and accounted for every rupee"}
                      </div>
                    </div>
                    {act.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#475569] shrink-0 ml-2" />
                    )}
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
