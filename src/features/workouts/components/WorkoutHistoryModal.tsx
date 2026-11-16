"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Dumbbell,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  Flame,
  Loader2,
  Plus,
} from "lucide-react";
import { IWorkout, WorkoutSplit } from "@/models/Workout";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

interface WorkoutHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditWorkout: (workout: IWorkout) => void;
  onLogNewWorkout: () => void;
}

const SPLIT_COLORS: Record<WorkoutSplit, string> = {
  PUSH: "bg-rose-950/40 border-rose-500/40 text-rose-400",
  PULL: "bg-sky-950/40 border-sky-500/40 text-sky-400",
  LEGS: "bg-emerald-950/40 border-emerald-500/40 text-emerald-400",
  UPPER: "bg-purple-950/40 border-purple-500/40 text-purple-400",
  LOWER: "bg-amber-950/40 border-amber-500/40 text-amber-400",
  CUSTOM: "bg-slate-900 border-slate-700 text-slate-300",
};

export default function WorkoutHistoryModal({
  isOpen,
  onClose,
  onEditWorkout,
  onLogNewWorkout,
}: WorkoutHistoryModalProps) {
  const queryClient = useQueryClient();
  const [workoutToDelete, setWorkoutToDelete] = useState<IWorkout | null>(null);

  const { data: workouts = [], isLoading } = useQuery<IWorkout[]>({
    queryKey: ["workouts"],
    queryFn: async () => {
      const res = await fetch("/api/workouts?limit=30");
      const json = await res.json();
      return json.data || [];
    },
    enabled: isOpen,
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to delete workout session");
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
      setWorkoutToDelete(null);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl border border-[#1F2435] bg-[#0B0D13] p-4 sm:p-6 font-mono text-white shadow-2xl space-y-4 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1F2435] pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                WORKOUT HISTORY &amp; LOGS
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#94A3B8]">
                Review, edit, or purge physical training sessions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onLogNewWorkout();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold hover:bg-rose-600/30 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Session</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#64748B] hover:text-white p-1 rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[200px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#64748B] gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
              <span className="text-xs">Loading training logs...</span>
            </div>
          ) : workouts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-900/50 flex items-center justify-center mx-auto text-rose-400">
                <Dumbbell className="w-6 h-6" />
              </div>
              <p className="text-xs text-[#94A3B8]">No workout sessions logged yet.</p>
              <button
                onClick={() => {
                  onClose();
                  onLogNewWorkout();
                }}
                className="text-xs text-rose-400 hover:underline"
              >
                Log your first workout trial
              </button>
            </div>
          ) : (
            workouts.map((w) => {
              const totalSets = w.exercises.reduce(
                (sum, e) => sum + (e.sets?.length || 0),
                0
              );
              const splitClass = SPLIT_COLORS[w.split] || SPLIT_COLORS.CUSTOM;

              return (
                <div
                  key={w._id.toString()}
                  className="hud-card p-4 rounded-xl border border-[#1F2435] hover:border-rose-900/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[9px] uppercase px-2 py-0.5 rounded border font-bold ${splitClass}`}
                      >
                        {w.split}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate">
                        {w.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#94A3B8] flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#00F0FF]" />
                        {w.targetDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {w.durationMinutes}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-rose-400" />
                        Intensity {w.intensityRating}/10
                      </span>
                      <span>
                        • {w.exercises.length} Exercises ({totalSets} Sets)
                      </span>
                    </div>

                    {w.notes && (
                      <p className="text-xs text-[#64748B] italic line-clamp-1">
                        &ldquo;{w.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onClose();
                        onEditWorkout(w);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#1F2435] bg-[#131620] hover:border-[#00F0FF]/50 text-xs text-[#CBD5E1] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setWorkoutToDelete(w)}
                      className="p-2 rounded-lg border border-[#1F2435] bg-[#131620] hover:border-rose-600/50 text-[#64748B] hover:text-rose-400 transition-all cursor-pointer"
                      title="Delete workout"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          isOpen={!!workoutToDelete}
          onClose={() => setWorkoutToDelete(null)}
          onConfirm={() => {
            if (workoutToDelete) {
              deleteWorkoutMutation.mutate(workoutToDelete._id.toString());
            }
          }}
          title="DELETE WORKOUT SESSION"
          itemName={workoutToDelete ? `${workoutToDelete.title} (${workoutToDelete.targetDate})` : "Workout"}
          description="Are you sure you want to delete this workout log?"
          warningText="If this was your only workout for the day, your Daily Protocol gym completion activity will uncheck and daily scores will recalculate automatically."
          isPending={deleteWorkoutMutation.isPending}
        />
      </div>
    </div>
  );
}
