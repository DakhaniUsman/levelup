"use client";

import { useState } from "react";
import { X, Swords, Loader2 } from "lucide-react";
import { QuestDifficulty, QuestFrequency } from "@/models/Quest";
import { TaskCategory } from "@/models/Task";

interface CreateQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: TaskCategory[] = [
  "PERSONAL",
  "CAREER",
  "FITNESS",
  "LEARNING",
  "SPIRITUAL",
  "FINANCE",
  "BUSINESS",
];

const DIFFICULTIES: QuestDifficulty[] = ["EASY", "MEDIUM", "HARD", "EPIC"];
const FREQUENCIES: QuestFrequency[] = ["DAILY", "WEEKDAYS", "WEEKLY"];

export default function CreateQuestModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateQuestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("PERSONAL");
  const [difficulty, setDifficulty] = useState<QuestDifficulty>("EASY");
  const [frequency, setFrequency] = useState<QuestFrequency>("DAILY");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          category,
          difficulty,
          frequency,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create quest");
      }

      onSuccess();
      onClose();
      setTitle("");
      setDescription("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create quest");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="hud-card w-full max-w-lg p-4 sm:p-6 rounded-2xl border border-[#1F2435] shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#1F2435]">
          <div className="flex items-center gap-2 text-[#00F0FF] font-mono text-sm font-bold">
            <Swords className="w-4 h-4" />
            <span>INITIALIZE NEW DAILY QUEST</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-[#FF2A55]/10 border border-[#FF2A55]/30 text-xs text-[#FF2A55] font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[#94A3B8] uppercase tracking-wider mb-1">
              Quest Objective (Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study System Architecture for 45 mins"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#94A3B8] uppercase tracking-wider mb-1">
              Description / Victory Condition (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Read and summarize chapter 3..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#00F0FF] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#94A3B8] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white focus:border-[#00F0FF] focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#94A3B8] uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as QuestDifficulty)}
                className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white focus:border-[#00F0FF] focus:outline-none"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#94A3B8] uppercase tracking-wider mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as QuestFrequency)}
                className="w-full px-3 py-2 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white focus:border-[#00F0FF] focus:outline-none"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#1F2435] text-[#94A3B8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-[#00F0FF] text-[#090A0F] font-bold hover:bg-[#00F0FF]/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>INITIALIZE QUEST</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

