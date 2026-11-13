"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Skull, AlertTriangle, X, Loader2, Flame } from "lucide-react";

interface SystemJudgementModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayXP: number;
}

export default function SystemJudgementModal({
  isOpen,
  onClose,
  todayXP,
}: SystemJudgementModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const judgementMutation = useMutation({
    mutationFn: async (transgressionReason: string) => {
      const res = await fetch("/api/protocol/judgement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: transgressionReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to execute judgement");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
      queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setReason("");
      setConfirmed(false);
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl border-2 border-rose-600 bg-[#0B0D13] p-4 sm:p-6 font-mono text-white shadow-[0_0_50px_rgba(225,29,72,0.4)] space-y-4 sm:space-y-5 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-rose-900/60 pb-4">
          <div className="flex items-center gap-3 text-rose-500">
            <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-700/60">
              <Skull className="w-6 h-6 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
                SYSTEM JUDGEMENT
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Transgression Protocol &amp; Retribution Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Severe Warning Alert */}
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-2 text-rose-200 text-xs">
          <div className="flex items-center gap-2 font-bold text-rose-400 uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            WARNING: UNCOMPROMISING PENALTY
          </div>
          <p className="leading-relaxed">
            Executing System Judgement declares a formal transgression (sin, discipline breach, or broken covenant). The System will immediately:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-rose-300 font-semibold">
            <li>
              Purge <span className="underline font-bold text-white">100% of today&apos;s earned XP</span> (-{todayXP} XP).
            </li>
            <li>
              <span className="underline font-bold text-white">Break all active habit streaks</span> (reset streak counter to 0).
            </li>
            <li>Mark today&apos;s Protocol as Transgressed in your permanent Hunter ledger.</li>
          </ul>
        </div>

        {/* Reason Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Reason for Transgression / Sin Declaration
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Broken vow, fell into bad habits, wasted time instead of discipline..."
            className="w-full rounded-xl bg-[#050608] border border-rose-900/60 px-3.5 py-2.5 text-xs text-white placeholder-[#475569] focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-3 text-xs text-[#CBD5E1] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 rounded border-rose-800 bg-[#050608] text-rose-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <span>
            I acknowledge this trial and accept the full purge of my daily XP and the reset of my habit streaks.
          </span>
        </label>

        {/* Error message */}
        {judgementMutation.isError && (
          <p className="text-xs text-rose-400">
            {(judgementMutation.error as Error)?.message || "Execution error"}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#1F2435] bg-[#131620] hover:bg-[#1F2435] text-xs font-bold text-[#94A3B8] hover:text-white transition-all cursor-pointer"
          >
            Cancel / Withdraw
          </button>
          <button
            type="button"
            onClick={() => judgementMutation.mutate(reason)}
            disabled={!confirmed || !reason.trim() || judgementMutation.isPending}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(225,29,72,0.5)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {judgementMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing Purge...</span>
              </>
            ) : (
              <>
                <Skull className="w-4 h-4" />
                <span>Execute Judgement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

