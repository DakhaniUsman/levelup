"use client";

import { Check, Flame, Trash2, Pause, Play, Zap } from "lucide-react";
import { HabitWithToday } from "@/features/habits/services/habit.service";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: HabitWithToday;
  onToggle: (id: string) => void;
  onPauseToggle: (id: string, isPaused: boolean) => void;
  onDelete: (id: string) => void;
  isToggling?: boolean;
}

export default function HabitCard({
  habit,
  onToggle,
  onPauseToggle,
  onDelete,
  isToggling,
}: HabitCardProps) {
  const isDone = habit.isCompletedToday;
  const isPaused = habit.isPaused;
  const streak = habit.currentStreak || 0;

  return (
    <div
      className={cn(
        "hud-card p-5 rounded-2xl border transition-all flex flex-col justify-between group relative overflow-hidden",
        isDone
          ? "border-emerald-500/40 bg-[#131620]/60 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          : isPaused
          ? "border-[#1F2435] opacity-50 bg-[#090A0F]"
          : "border-[#1F2435] hover:border-[#00F0FF]/40"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#131620] border border-[#1F2435] text-[#00F0FF]">
              {habit.category}
            </span>
            <span className="text-[10px] font-mono text-[#64748B] uppercase">
              [{habit.frequency}]
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onPauseToggle(habit._id.toString(), !isPaused)}
              className="p-1 rounded text-[#64748B] hover:text-white"
              title={isPaused ? "Resume Habit" : "Pause Habit"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onDelete(habit._id.toString())}
              className="p-1 rounded text-[#64748B] hover:text-[#FF2A55]"
              title="Delete Habit"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h3
              className={cn(
                "text-base font-bold font-mono text-white tracking-wide transition-all",
                isDone && "text-emerald-300"
              )}
            >
              {habit.title}
            </h3>
            {habit.description && (
              <p className="text-xs text-[#94A3B8] mt-1 font-sans line-clamp-2">
                {habit.description}
              </p>
            )}
          </div>

          {/* Quick Complete Button */}
          <button
            onClick={() => onToggle(habit._id.toString())}
            disabled={isToggling || isPaused}
            className={cn(
              "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:cursor-not-allowed",
              isDone
                ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-105"
                : "bg-[#090A0F] border-[#1F2435] text-[#64748B] hover:border-[#00F0FF] hover:text-[#00F0FF]"
            )}
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-[#1F2435]/60 flex items-center justify-between text-xs font-mono">
        {/* Streak indicator */}
        <div className="flex items-center gap-1.5">
          <Flame
            className={cn(
              "w-4 h-4 transition-all",
              streak > 0
                ? "text-amber-400 fill-amber-400 animate-pulse"
                : "text-[#64748B]"
            )}
          />
          <span
            className={cn(
              "font-bold",
              streak > 0 ? "text-amber-400" : "text-[#64748B]"
            )}
          >
            {streak} Day Streak
          </span>
          {habit.longestStreak > 0 && (
            <span className="text-[10px] text-[#64748B]">
              (Best: {habit.longestStreak})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-amber-400 font-bold">
          <Zap className="w-3.5 h-3.5 fill-amber-400" />
          <span>+{habit.xpReward} XP</span>
        </div>
      </div>
    </div>
  );
}

