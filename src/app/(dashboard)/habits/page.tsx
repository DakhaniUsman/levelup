"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, Plus, Loader2, Sparkles, Trophy } from "lucide-react";
import { HabitWithToday } from "@/features/habits/services/habit.service";
import HabitCard from "@/features/habits/components/HabitCard";
import HabitModal from "@/features/habits/components/HabitModal";
import { cn } from "@/lib/utils";

const FILTERS = ["ALL", "DAILY", "WEEKDAYS", "WEEKENDS"];

export default function HabitsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: habits = [], isLoading } = useQuery<HabitWithToday[]>({
    queryKey: ["habits"],
    queryFn: async () => {
      const res = await fetch("/api/habits");
      const json = await res.json();
      return json.data || [];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      setTogglingId(id);
      const res = await fetch(`/api/habits/${id}/toggle`, { method: "POST" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      // Trigger achievement check
      fetch("/api/achievements/check", { method: "POST" }).catch(() => {});
    },
    onSettled: () => {
      setTogglingId(null);
    },
  });

  const pauseMutation = useMutation({
    mutationFn: async ({ id, isPaused }: { id: string; isPaused: boolean }) => {
      const res = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaused }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const filteredHabits = habits.filter((h) => {
    if (activeFilter === "ALL") return true;
    return h.frequency === activeFilter;
  });

  const completedTodayCount = habits.filter((h) => h.isCompletedToday).length;
  const bestStreak = habits.reduce(
    (max, h) => Math.max(max, h.longestStreak || 0, h.currentStreak || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1F2435]">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-amber-400" />
            HABIT & STREAK PROTOCOL
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            "We are what we repeatedly do. Discipline is your greatest attribute."
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00F0FF] text-[#090A0F] font-mono font-bold text-xs hover:bg-[#00F0FF]/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>NEW HABIT DIRECTIVE</span>
        </button>
      </div>

      {/* Streak & Consistency Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="hud-card p-5 rounded-xl border border-[#1F2435] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Flame className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider">
              BEST CURRENT STREAK
            </span>
            <div className="text-2xl font-extrabold text-white">
              {bestStreak} Days
            </div>
          </div>
        </div>

        <div className="hud-card p-5 rounded-xl border border-[#1F2435] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider">
              COMPLETED TODAY
            </span>
            <div className="text-2xl font-extrabold text-white">
              {completedTodayCount} / {habits.length}
            </div>
          </div>
        </div>

        <div className="hud-card p-5 rounded-xl border border-[#1F2435] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center text-[#00F0FF]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider">
              ACTIVE PROTOCOLS
            </span>
            <div className="text-2xl font-extrabold text-white">
              {habits.filter((h) => !h.isPaused).length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 font-mono text-xs">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer",
              activeFilter === f
                ? "bg-[#00F0FF] text-[#090A0F] font-bold border-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                : "bg-[#131620] text-[#94A3B8] border-[#1F2435] hover:text-white"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Habits Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#64748B] font-mono text-xs gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#00F0FF]" />
          <span>SYNCHRONIZING HABIT CALENDARS...</span>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="hud-card p-12 text-center rounded-2xl border border-[#1F2435] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#1F2435]/50 flex items-center justify-center mx-auto text-[#64748B]">
            <Flame className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold font-mono text-white">
            No Habit Directives Found
          </h2>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto font-sans">
            You have no habit routines configured under this filter. Initialize your first daily routine to begin stacking streaks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit._id.toString()}
              habit={habit}
              isToggling={togglingId === habit._id.toString()}
              onToggle={(id) => toggleMutation.mutate(id)}
              onPauseToggle={(id, isPaused) =>
                pauseMutation.mutate({ id, isPaused })
              }
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Create Habit Modal */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["habits"] });
          queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
        }}
      />
    </div>
  );
}

