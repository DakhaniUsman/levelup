"use client";

import { useState, useRef, useEffect } from "react";
import {
  Check,
  Clock,
  Trash2,
  Calendar,
  Zap,
  MoreVertical,
  Edit3,
  Archive,
  RotateCcw,
} from "lucide-react";
import { ITask } from "@/models/Task";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: ITask;
  onToggleStatus: (taskId: string, newStatus: string) => void;
  onDelete: (task: ITask) => void;
  onEdit?: (task: ITask) => void;
  onToggleArchive?: (task: ITask) => void;
}

const PRIORITY_BADGES = {
  LOW: "bg-slate-800 text-slate-300 border-slate-700",
  MEDIUM: "bg-blue-950/60 text-blue-400 border-blue-800/40",
  HIGH: "bg-amber-950/60 text-amber-400 border-amber-800/40",
  URGENT: "bg-rose-950/60 text-rose-400 border-rose-800/40 animate-pulse",
};

export default function TaskCard({
  task,
  onToggleStatus,
  onDelete,
  onEdit,
  onToggleArchive,
}: TaskCardProps) {
  const isCompleted = task.status === "COMPLETED";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleToggle = () => {
    onToggleStatus(task._id.toString(), isCompleted ? "TODO" : "COMPLETED");
  };

  return (
    <div
      className={cn(
        "hud-card p-4 rounded-xl border transition-all flex flex-col justify-between group relative overflow-visible",
        isCompleted
          ? "border-emerald-900/30 bg-[#131620]/40 opacity-70"
          : "border-[#1F2435] hover:border-[#00F0FF]/40"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Custom Checkbox */}
            <button
              onClick={handleToggle}
              className={cn(
                "mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0",
                isCompleted
                  ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "border-[#1F2435] bg-[#090A0F] hover:border-[#00F0FF] text-transparent hover:text-[#00F0FF]/40"
              )}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  "text-sm font-semibold text-white tracking-wide font-mono transition-all truncate",
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

          {/* 3-Dot Action Menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-md text-[#64748B] hover:text-white hover:bg-[#1F2435]/60 transition-colors cursor-pointer"
              title="Directive Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 rounded-xl border border-[#1F2435] bg-[#0E1118] shadow-2xl py-1 z-30 font-mono text-xs animate-in fade-in duration-100">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEdit(task);
                    }}
                    className="w-full px-3 py-1.5 text-left text-[#CBD5E1] hover:text-white hover:bg-[#1F2435] flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>Edit Directive</span>
                  </button>
                )}
                {onToggleArchive && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleArchive(task);
                    }}
                    className="w-full px-3 py-1.5 text-left text-[#CBD5E1] hover:text-white hover:bg-[#1F2435] flex items-center gap-2 cursor-pointer"
                  >
                    {task.isArchived ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Restore Directive</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-3.5 h-3.5 text-amber-400" />
                        <span>Archive Directive</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(task);
                  }}
                  className="w-full px-3 py-1.5 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Directive</span>
                </button>
              </div>
            )}
          </div>
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

