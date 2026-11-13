"use client";

import { useState } from "react";
import { AlertTriangle, Dumbbell, Footprints, ShieldCheck, Zap } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IPenaltyProgress } from "@/models/DailyProtocol";

interface PenaltyZoneBannerProps {
  penalty: IPenaltyProgress;
  inPenaltyZone: boolean;
}

export default function PenaltyZoneBanner({
  penalty,
  inPenaltyZone,
}: PenaltyZoneBannerProps) {
  const queryClient = useQueryClient();
  const [customSteps, setCustomSteps] = useState("");

  const penaltyMutation = useMutation({
    mutationFn: async (payload: { pushups?: number; squats?: number; steps?: number }) => {
      const res = await fetch("/api/protocol/penalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  if (!inPenaltyZone && !penalty.isCleared) {
    return null;
  }

  if (penalty.isCleared) {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 font-mono flex items-center justify-between text-emerald-400">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wider">
              Penalty Trial Overcome
            </div>
            <p className="text-[11px] text-emerald-300/80">
              Retribution completed: 20 Pushups, 20 Squats & 10,000 Steps conquered. System normalized.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pushupPct = Math.min(100, Math.round((penalty.pushupsDone / penalty.pushupsTarget) * 100));
  const squatPct = Math.min(100, Math.round((penalty.squatsDone / penalty.squatsTarget) * 100));
  const stepPct = Math.min(100, Math.round((penalty.stepsDone / penalty.stepsTarget) * 100));

  return (
    <div className="rounded-xl border-2 border-rose-600/70 bg-gradient-to-r from-rose-950/40 via-[#0B0D13] to-rose-950/40 p-5 font-mono shadow-[0_0_25px_rgba(225,29,72,0.25)] space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-rose-900/40 pb-3">
        <div className="flex items-center gap-2 text-rose-500">
          <AlertTriangle className="w-5 h-5 animate-bounce shrink-0" />
          <span className="font-black text-sm uppercase tracking-widest text-rose-400">
            EMERGENCY: SYSTEM PENALTY ZONE ENGAGED
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded bg-rose-500/20 border border-rose-500 text-rose-300 font-bold">
          Retribution Required
        </span>
      </div>

      <p className="text-xs text-rose-200/90 leading-relaxed">
        Mandatory 5-Sphere protocol was missed yesterday (&lt;70%). In accordance with System rules, survival requires physical restitution before midnight:
      </p>

      {/* Progress Bars & Quick Increment Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Pushups */}
        <div className="bg-[#090A0F]/80 p-3.5 rounded-lg border border-rose-900/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8] font-bold flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-rose-400" />
              PUSHUPS
            </span>
            <span className="text-rose-400 font-bold">
              {penalty.pushupsDone} / {penalty.pushupsTarget}
            </span>
          </div>
          <div className="w-full bg-[#1F2435] h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${pushupPct}%` }}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => penaltyMutation.mutate({ pushups: 5 })}
              disabled={penaltyMutation.isPending || penalty.pushupsDone >= penalty.pushupsTarget}
              className="flex-1 py-1 text-[11px] rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-200 disabled:opacity-40 cursor-pointer"
            >
              +5 Reps
            </button>
            <button
              onClick={() => penaltyMutation.mutate({ pushups: 10 })}
              disabled={penaltyMutation.isPending || penalty.pushupsDone >= penalty.pushupsTarget}
              className="flex-1 py-1 text-[11px] rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-200 disabled:opacity-40 cursor-pointer"
            >
              +10 Reps
            </button>
          </div>
        </div>

        {/* 2. Squats */}
        <div className="bg-[#090A0F]/80 p-3.5 rounded-lg border border-rose-900/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8] font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              SQUATS
            </span>
            <span className="text-rose-400 font-bold">
              {penalty.squatsDone} / {penalty.squatsTarget}
            </span>
          </div>
          <div className="w-full bg-[#1F2435] h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${squatPct}%` }}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => penaltyMutation.mutate({ squats: 5 })}
              disabled={penaltyMutation.isPending || penalty.squatsDone >= penalty.squatsTarget}
              className="flex-1 py-1 text-[11px] rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-200 disabled:opacity-40 cursor-pointer"
            >
              +5 Reps
            </button>
            <button
              onClick={() => penaltyMutation.mutate({ squats: 10 })}
              disabled={penaltyMutation.isPending || penalty.squatsDone >= penalty.squatsTarget}
              className="flex-1 py-1 text-[11px] rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-200 disabled:opacity-40 cursor-pointer"
            >
              +10 Reps
            </button>
          </div>
        </div>

        {/* 3. Steps */}
        <div className="bg-[#090A0F]/80 p-3.5 rounded-lg border border-rose-900/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8] font-bold flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-rose-400" />
              STEPS
            </span>
            <span className="text-rose-400 font-bold">
              {penalty.stepsDone.toLocaleString()} / {penalty.stepsTarget.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-[#1F2435] h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${stepPct}%` }}
            />
          </div>
          <div className="flex gap-1.5 pt-1">
            <button
              onClick={() => penaltyMutation.mutate({ steps: 1000 })}
              disabled={penaltyMutation.isPending || penalty.stepsDone >= penalty.stepsTarget}
              className="flex-1 py-1 text-[10px] rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 text-rose-200 disabled:opacity-40 cursor-pointer"
            >
              +1,000
            </button>
            <input
              type="number"
              placeholder="+Steps"
              value={customSteps}
              onChange={(e) => setCustomSteps(e.target.value)}
              className="w-16 px-1.5 text-[10px] bg-[#050608] border border-rose-800/60 rounded text-white text-center"
            />
            <button
              onClick={() => {
                const val = parseInt(customSteps, 10);
                if (val > 0) {
                  penaltyMutation.mutate({ steps: val });
                  setCustomSteps("");
                }
              }}
              disabled={penaltyMutation.isPending || !customSteps}
              className="px-2 py-1 text-[10px] rounded bg-rose-700 hover:bg-rose-600 text-white font-bold disabled:opacity-40 cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

