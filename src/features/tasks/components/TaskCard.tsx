"use client";

import { Check, Clock, Trash2, Calendar, Zap } from "lucide-react";
import { ITask } from "@/models/Task";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: ITask;
  onToggleStatus: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
}

const PRIORITY_BADGES = {
  LOW: "bg-slate-800 text-slate-300 border-slate-700",
  MEDIUM: "bg-blue-950/60 text-blue-400 border-blue-800/40",
  HIGH: "bg-amber-950/60 text-amber-400 border-amber-800/40",
  URGENT: "bg-rose-950/60 text-rose-400 border-rose-800/40 animate-pulse",
};

export default function TaskCard({ task, onToggleStatus, onDelete }: TaskCardProps) {
  const isCompleted = task.status === "COMPLETED";

  const handleToggle = () => {
    onToggleStatus(task._id.toString(), isCompleted ? "TODO" : "COMPLETED");
  };

  return (
    <div
      className={cn(
        "hud-card p-4 rounded-xl border transition-all flex flex-col justify-between group",
        isCompleted
          ? "border-emerald-900/30 bg-[#131620]/40 opacity-70"
          : "border-[#1F2435] hover:border-[#00F0FF]/40"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Custom Checkbox */}
            <button
              onClick={handleToggle}
              className={cn(
                "mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer",
                isCompleted
                  ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "border-[#1F2435] bg-[#090A0F] hover:border-[#00F0FF] text-transparent hover:text-[#00F0FF]/40"
              )}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            <div>
              <h3
                className={cn(
                  "text-sm font-semibold text-white tracking-wide font-mono transition-all",
                  isCompleted && "line-through text-[#64748B]"
                )}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2 font-sans">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onDelete(task._id.toString())}
            className="opacity-0 group-hover:opacity-100 text-[#64748B] hover:text-[#FF2A55] transition-all p-1"
            title="Delete Directive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#1F2435]/60 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-2">
          {/* Category */}
          <span className="px-2 py-0.5 rounded bg-[#131620] border border-[#1F2435] text-[#94A3B8]">
            {task.category}
          </span>

          {/* Priority */}
          <span
            className={cn(
              "px-2 py-0.5 rounded border text-[10px] font-bold",
              PRIORITY_BADGES[task.priority]
            )}
          >
            {task.priority}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#64748B]">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[#00F0FF]/80">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}

          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.estimatedMinutes}m
          </span>

          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
            <Zap className="w-3 h-3 fill-amber-400" />
            +{task.xpReward} XP
          </span>
        </div>
      </div>
    </div>
  );
}

