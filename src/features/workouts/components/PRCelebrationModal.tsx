"use client";

import { Trophy, Award, Flame, Zap, Check } from "lucide-react";
import { NewPRAchievement } from "../services/pr-detection.service";

interface PRCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prs: NewPRAchievement[];
}

export default function PRCelebrationModal({
  isOpen,
  onClose,
  prs,
}: PRCelebrationModalProps) {
  if (!isOpen || prs.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#090A0F] border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] font-mono text-center overflow-hidden">
        {/* Top holographic accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Glow orb */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              HUNTER AWAKENING ACHIEVED
            </span>
            <h2 className="text-xl font-black text-white tracking-wide mt-1">
              PERSONAL RECORD CRUSHED!
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              The System has verified progressive overload. Your strength parameters have evolved.
            </p>
          </div>

          {/* PR Items List */}
          <div className="space-y-2.5 my-3 text-left">
            {prs.map((pr, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#131620] border border-amber-500/30 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs">
                      {pr.exerciseName}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/40 font-bold uppercase">
                      {pr.prType === "WEIGHT_PR" ? "Max Weight PR" : "Max Reps PR"}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#94A3B8] mt-1">
                    {pr.prType === "WEIGHT_PR" ? (
                      <span>
                        Previous: <span className="line-through">{pr.previousValue} kg</span> &rarr;{" "}
                        <strong className="text-emerald-400 font-bold">{pr.newValue} kg</strong> ({pr.reps} reps)
                      </span>
                    ) : (
                      <span>
                        Previous: <span className="line-through">{pr.previousValue} reps</span> &rarr;{" "}
                        <strong className="text-emerald-400 font-bold">{pr.newValue} reps</strong> @ {pr.weightKg} kg
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span className="text-xs font-black text-[#00F0FF] flex items-center gap-0.5">
                    <Zap className="w-3.5 h-3.5 text-[#00F0FF]" /> +25 XP
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#090A0F] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>CLAIM RECORDS &amp; CONTINUE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
