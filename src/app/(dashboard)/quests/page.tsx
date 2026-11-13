"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Swords, Plus, Loader2, Sparkles, Trophy } from "lucide-react";
import { PopulatedOccurrence } from "@/features/quests/services/quest.service";
import QuestCard from "@/features/quests/components/QuestCard";
import CreateQuestModal from "@/features/quests/components/CreateQuestModal";

export default function QuestsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const { data: occurrences = [], isLoading } = useQuery<PopulatedOccurrence[]>({
    queryKey: ["today-quests"],
    queryFn: async () => {
      const res = await fetch("/api/quests/today");
      const json = await res.json();
      return json.data || [];
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (occurrenceId: string) => {
      setCompletingId(occurrenceId);
      const res = await fetch(`/api/quests/occurrences/${occurrenceId}/complete`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["today-quests"] });
      queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
    },
    onSettled: () => {
      setCompletingId(null);
    },
  });

  const total = occurrences.length;
  const completed = occurrences.filter((o) => o.status === "COMPLETED").length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1F2435]">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <Swords className="w-6 h-6 text-[#00F0FF]" />
            DAILY QUEST BOARD
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Standard daily hunter trial requirements. Complete daily to sustain progress.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00F0FF] text-[#090A0F] font-mono font-bold text-xs hover:bg-[#00F0FF]/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>NEW QUEST TRIAL</span>
        </button>
      </div>

      {/* Daily Progress Banner */}
      <div className="hud-card p-6 rounded-2xl border border-[#1F2435] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#00F0FF] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TODAY'S COMPLETION RATE</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              {completed} / {total}{" "}
              <span className="text-sm font-normal text-[#94A3B8]">
                Quests Cleared ({percent}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-48 bg-[#090A0F] h-3 rounded-full overflow-hidden border border-[#1F2435] p-0.5">
              <div
                className="bg-gradient-to-r from-[#0088FF] to-[#00F0FF] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(0,240,255,0.6)]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-[#00F0FF]">
              {percent}%
            </span>
          </div>
        </div>
      </div>

      {/* Quests Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#64748B] font-mono text-xs gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#00F0FF]" />
          <span>SCANNING ACTIVE DAILY TRIALS...</span>
        </div>
      ) : occurrences.length === 0 ? (
        <div className="hud-card p-12 text-center rounded-2xl border border-[#1F2435] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#1F2435]/50 flex items-center justify-center mx-auto text-[#64748B]">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold font-mono text-white">
            No Active Daily Quests
          </h2>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto font-sans">
            You have no recurring daily quests configured. Create your first trial to start leveling up every day.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {occurrences.map((occ) => (
            <QuestCard
              key={occ._id.toString()}
              occurrence={occ}
              isCompleting={completingId === occ._id.toString()}
              onComplete={(id) => completeMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Quest Modal */}
      <CreateQuestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["today-quests"] });
        }}
      />
    </div>
  );
}

