"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Plus,
  Trash2,
  Receipt,
  Coffee,
  Navigation,
  Film,
  Users,
  CircleDot,
  Loader2,
} from "lucide-react";
import { ExpenseCategory, IExpense } from "@/models/Expense";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { label: string; value: ExpenseCategory; icon: typeof Coffee }[] = [
  { label: "Food & Meals", value: "FOOD", icon: Coffee },
  { label: "Travelling / Commute", value: "TRAVELLING", icon: Navigation },
  { label: "Entertainment", value: "ENTERTAINMENT", icon: Film },
  { label: "Outing & Social", value: "OUTING", icon: Users },
  { label: "Miscellaneous", value: "MISCELLANEOUS", icon: CircleDot },
];

export default function ExpenseModal({ isOpen, onClose }: ExpenseModalProps) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("FOOD");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useQuery<{
    expenses: IExpense[];
    totalSpent: number;
    targetDate: string;
  }>({
    queryKey: ["expenses-today"],
    queryFn: async () => {
      const res = await fetch("/api/expenses");
      const json = await res.json();
      return json.data;
    },
    enabled: isOpen,
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (payload: { amount: number; category: ExpenseCategory; description: string }) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses-today"] });
      queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
      setAmount("");
      setDescription("");
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses-today"] });
      queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !description.trim()) return;
    createExpenseMutation.mutate({
      amount: num,
      category,
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#1F2435] bg-[#0B0D13] p-4 sm:p-6 font-mono text-white shadow-2xl space-y-4 sm:space-y-5 animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1F2435] pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                DAILY FINANCIAL AUDIT
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#94A3B8]">
                Log &amp; analyze today&apos;s spending ledger
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

        {/* Total Banner */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-[#050608] border border-[#1F2435] flex items-center justify-between shrink-0">
          <span className="text-[11px] sm:text-xs text-[#94A3B8] font-mono uppercase tracking-wider">
            TOTAL SPENT TODAY
          </span>
          <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
            ₹{data?.totalSpent?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="text-xs font-bold text-[#64748B] absolute left-3 top-2.5">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#050608] border border-[#1F2435] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#00F0FF]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-lg bg-[#050608] border border-[#1F2435] text-xs text-white focus:outline-none focus:border-[#00F0FF]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">
              Description / Notes
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                placeholder="e.g. Nutritious Lunch with protein shake, metro card, coffee..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#050608] border border-[#1F2435] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#00F0FF]"
              />
              <button
                type="submit"
                disabled={createExpenseMutation.isPending}
                className="px-4 py-2 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/25 text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {createExpenseMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Log Expense</span>
              </button>
            </div>
          </div>
        </form>

        {/* Expenses List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px]">
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider block">
            TODAY&apos;S TRANSACTIONS ({data?.expenses?.length || 0})
          </span>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 text-[#00F0FF] animate-spin" />
            </div>
          ) : !data?.expenses || data.expenses.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#64748B] font-mono">
              No expenses recorded today yet.
            </div>
          ) : (
            data.expenses.map((item) => (
              <div
                key={item._id.toString()}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#050608] border border-[#1F2435] text-xs font-mono gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#131620] border border-[#1F2435] text-emerald-400">
                      {item.category}
                    </span>
                    <span className="text-white font-medium truncate">{item.description}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="font-bold text-emerald-400">
                    ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => deleteExpenseMutation.mutate(item._id.toString())}
                    className="text-[#64748B] hover:text-rose-400 transition-colors p-1"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
