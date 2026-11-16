"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Sparkles, BookOpen, Dumbbell, Heart, DollarSign, Loader2 } from "lucide-react";
import { IProtocolItem, ProtocolSphere, ProtocolItemType } from "@/models/ProtocolItem";

interface ProtocolItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: IProtocolItem | null;
  defaultSphere?: ProtocolSphere;
}

const SPHERES: { value: ProtocolSphere; label: string; icon: typeof Sparkles; color: string }[] = [
  { value: "SPIRITUALITY", label: "Spirituality", icon: Sparkles, color: "text-purple-400" },
  { value: "MENTAL", label: "Mental Discipline", icon: BookOpen, color: "text-[#00F0FF]" },
  { value: "PHYSICAL", label: "Physical Health", icon: Dumbbell, color: "text-rose-400" },
  { value: "EMOTIONAL", label: "Emotional Harmony", icon: Heart, color: "text-pink-400" },
  { value: "FINANCIAL", label: "Financial Discipline", icon: DollarSign, color: "text-emerald-400" },
];

const ITEM_TYPES: { value: ProtocolItemType; label: string; description: string }[] = [
  {
    value: "CHECKBOX",
    label: "Standard Checkbox",
    description: "One-click daily habit or task completion",
  },
  {
    value: "PRAYER_TRACKER",
    label: "5 Daily Prayers Tracker",
    description: "Specialized multi-step tracker with Fajr, Dhuhr, Asr, Maghrib, and Isha pills",
  },
  {
    value: "WORKOUT_LOG",
    label: "Gym Session & Workout Logger",
    description: "Integrates with Progressive Overload Gym Logger modal and awards +75 XP",
  },
  {
    value: "FINANCIAL_AUDIT",
    label: "Financial Expense Audit",
    description: "Integrates with Daily Expense Audit modal and tracks today's spending in ₹",
  },
];

export default function ProtocolItemModal({
  isOpen,
  onClose,
  itemToEdit,
  defaultSphere = "SPIRITUALITY",
}: ProtocolItemModalProps) {
  const queryClient = useQueryClient();
  const [sphere, setSphere] = useState<ProtocolSphere>(defaultSphere);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProtocolItemType>("CHECKBOX");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setSphere(itemToEdit.sphere);
      setTitle(itemToEdit.title);
      setDescription(itemToEdit.description || "");
      setType(itemToEdit.type || "CHECKBOX");
      setIsActive(itemToEdit.isActive !== false);
    } else {
      setSphere(defaultSphere);
      setTitle("");
      setDescription("");
      setType("CHECKBOX");
      setIsActive(true);
    }
    setError(null);
  }, [itemToEdit, defaultSphere, isOpen]);

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      sphere: ProtocolSphere;
      title: string;
      description: string;
      type: ProtocolItemType;
      isActive: boolean;
    }) => {
      const url = itemToEdit
        ? `/api/protocol/items/${itemToEdit._id}`
        : `/api/protocol/items`;
      const method = itemToEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to save protocol activity");
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocol-items"] });
      queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Activity title is required");
      return;
    }

    saveMutation.mutate({
      sphere,
      title: title.trim(),
      description: description.trim(),
      type,
      isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#1F2435] bg-[#0B0D13] p-4 sm:p-6 font-mono text-white shadow-2xl space-y-4 sm:space-y-5 animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1F2435] pb-3 sm:pb-4 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-[#00F0FF]">⚡</span>
              <span>{itemToEdit ? "EDIT PROTOCOL ACTIVITY" : "NEW PROTOCOL ACTIVITY"}</span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-[#94A3B8] mt-0.5">
              Configure your daily 1% progression items
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-700/50 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          {/* Sphere Selector */}
          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1.5 font-bold">
              Living Sphere
            </label>
            <select
              value={sphere}
              onChange={(e) => setSphere(e.target.value as ProtocolSphere)}
              className="w-full px-3 py-2 rounded-lg bg-[#050608] border border-[#1F2435] text-xs text-white focus:outline-none focus:border-[#00F0FF]"
            >
              {SPHERES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Title */}
          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1.5 font-bold">
              Activity Title *
            </label>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="e.g. Read 20 Pages, Morning Workout, Learning Arabic..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#050608] border border-[#1F2435] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#00F0FF]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1.5 font-bold">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              maxLength={300}
              placeholder="Context, targets, or specific directions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#050608] border border-[#1F2435] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#00F0FF]"
            />
          </div>

          {/* Activity Type */}
          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1.5 font-bold">
              Activity Type &amp; Special Integration
            </label>
            <div className="space-y-2">
              {ITEM_TYPES.map((t) => (
                <label
                  key={t.value}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    type === t.value
                      ? "bg-[#131620] border-[#00F0FF]/50 text-white shadow-[0_0_10px_rgba(0,240,255,0.1)]"
                      : "bg-[#050608] border-[#1F2435] text-[#94A3B8] hover:border-[#1F2435]/80 hover:text-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="activityType"
                    value={t.value}
                    checked={type === t.value}
                    onChange={() => setType(t.value)}
                    className="mt-0.5 text-[#00F0FF] focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{t.label}</div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">{t.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#050608] border border-[#1F2435]">
            <div>
              <span className="text-xs font-bold text-white block">Activity Active State</span>
              <span className="text-[10px] text-[#64748B]">
                Disabled activities are hidden from future daily protocols without losing past records.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#1F2435] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00F0FF]"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#1F2435] bg-[#131620] hover:bg-[#1F2435] text-xs font-bold text-[#94A3B8] hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-[#00F0FF] text-[#090A0F] hover:bg-[#00F0FF]/90 text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{itemToEdit ? "Update Activity" : "Create Activity"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

