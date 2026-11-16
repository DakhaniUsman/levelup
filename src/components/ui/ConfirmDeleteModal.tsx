"use client";

import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  description?: string;
  warningText?: string;
  isPending?: boolean;
  confirmLabel?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  description = "Are you sure you want to permanently remove this record?",
  warningText = "All historical XP, completion records, and ledger entries remain safely preserved.",
  isPending = false,
  confirmLabel = "Confirm Delete",
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-rose-800/60 bg-[#0B0D13] p-4 sm:p-6 font-mono text-white shadow-[0_0_40px_rgba(225,29,72,0.3)] space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-rose-950 pb-3">
          <div className="flex items-center gap-2.5 text-rose-500">
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/60">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-rose-400">
                {title}
              </h3>
              <p className="text-[10px] text-[#94A3B8]">
                System Destruction Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-[#64748B] hover:text-white p-1 rounded transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-xs text-[#CBD5E1] leading-relaxed">
          <p>
            {description}{" "}
            <span className="text-white font-bold">&ldquo;{itemName}&rdquo;</span>?
          </p>
          {warningText && (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-[11px] leading-snug">
              🛡️ <span className="font-bold">Historical Records Preserved:</span>{" "}
              {warningText}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl border border-[#1F2435] bg-[#131620] hover:bg-[#1F2435] text-xs font-bold text-[#94A3B8] hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

