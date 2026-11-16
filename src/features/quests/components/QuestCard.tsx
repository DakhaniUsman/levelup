"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Zap, Swords, Loader2, MoreVertical, Edit3, Trash2 } from "lucide-react";
import { PopulatedOccurrence } from "@/features/quests/services/quest.service";
import { IQuest, QuestDifficulty } from "@/models/Quest";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  occurrence: PopulatedOccurrence;
  onComplete: (occurrenceId: string) => void;
  isCompleting?: boolean;
  onEdit?: (quest: IQuest) => void;
  onDelete?: (quest: IQuest) => void;
}

const DIFFICULTY_STYLES: Record<
  QuestDifficulty,
  { label: string; border: string; bg: string; text: string; glow: string }
> = {
  EASY: {
    label: "E-RANK (EASY)",
    border: "border-[#00F0FF]/30",
    bg: "bg-[#00F0FF]/10",
    text: "text-[#00F0FF]",
    glow: "shadow-[0_0_15px_rgba(0,240,255,0.15)]",
  },
  MEDIUM: {
    label: "D-RANK (MEDIUM)",
    border: "border-[#0088FF]/30",
    bg: "bg-[#0088FF]/10",
    text: "text-[#0088FF]",
    glow: "shadow-[0_0_15px_rgba(0,136,255,0.15)]",
  },
  HARD: {
    label: "B-RANK (HARD)",
    border: "border-[#8A2BE2]/40",
    bg: "bg-[#8A2BE2]/10",
    text: "text-[#8A2BE2]",
    glow: "shadow-[0_0_15px_rgba(138,43,226,0.2)]",
  },
  EPIC: {
    label: "S-RANK (EPIC)",
    border: "border-[#FF2A55]/50",
    bg: "bg-[#FF2A55]/15",
    text: "text-[#FF2A55]",
    glow: "shadow-[0_0_20px_rgba(255,42,85,0.25)]",
  },
};

export default function QuestCard({
  occurrence,
  onComplete,
  isCompleting,
  onEdit,
  onDelete,
}: QuestCardProps) {
  const quest = occurrence.questId;
  const isCompleted = occurrence.status === "COMPLETED";
  const difficulty = (quest?.difficulty as QuestDifficulty) || "EASY";
  const style = DIFFICULTY_STYLES[difficulty];
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

  return (
    <div
      className={cn(
        "hud-card p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-visible",
        isCompleted
          ? "border-emerald-900/40 bg-[#131620]/40 opacity-80"
          : `${style.border} ${style.glow}`
      )}
    >
      <div>
        {/* Header row: Difficulty & XP Badge + 3-Dot Action Menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={cn(
              "px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-wider uppercase border",
              style.bg,
              style.border,
              style.text
            )}
          >
            {style.label}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#090A0F] border border-[#1F2435] text-xs font-mono font-bold text-amber-400">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              +{quest?.xpReward || 10} XP
            </span>

            {(onEdit || onDelete) && quest && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1 rounded-md text-[#64748B] hover:text-white hover:bg-[#1F2435]/60 transition-colors cursor-pointer"
                  title="Quest Actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 w-36 rounded-xl border border-[#1F2435] bg-[#0E1118] shadow-2xl py-1 z-30 font-mono text-xs animate-in fade-in duration-100">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onEdit(quest);
                        }}
                        className="w-full px-3 py-1.5 text-left text-[#CBD5E1] hover:text-white hover:bg-[#1F2435] flex items-center gap-2 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#00F0FF]" />
                        <span>Edit Quest</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onDelete(quest);
                        }}
                        className="w-full px-3 py-1.5 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Quest</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title and description */}
        <h3
          className={cn(
            "text-base font-bold font-mono text-white tracking-wide",
            isCompleted && "line-through text-[#64748B]"
          )}
        >
          {quest?.title || "Daily Quest"}
        </h3>

        {quest?.description && (
          <p className="text-xs text-[#94A3B8] mt-1.5 font-sans leading-relaxed">
            {quest.description}
          </p>
        )}
      </div>

      {/* Footer row: Category & Completion Button */}
      <div className="mt-5 pt-3.5 border-t border-[#1F2435]/60 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
          [{quest?.category || "DAILY"}]
        </span>

        {isCompleted ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>COMPLETED</span>
          </div>
        ) : (
          <button
            onClick={() => onComplete(occurrence._id.toString())}
            disabled={isCompleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F0FF] text-[#090A0F] text-xs font-mono font-bold hover:bg-[#00F0FF]/90 transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer disabled:opacity-50"
          >
            {isCompleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Swords className="w-3.5 h-3.5" />
            )}
            <span>COMPLETE QUEST</span>
          </button>
        )}
      </div>
    </div>
  );
}

