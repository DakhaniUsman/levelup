"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  BookOpen,
  Dumbbell,
  Heart,
  DollarSign,
  Loader2,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { IProtocolItem, ProtocolSphere } from "@/models/ProtocolItem";
import ProtocolItemModal from "@/features/protocol/components/ProtocolItemModal";
import ProtocolDeleteModal from "@/features/protocol/components/ProtocolDeleteModal";

interface SphereConfig {
  sphere: ProtocolSphere;
  title: string;
  description: string;
  icon: typeof Sparkles;
  color: string;
  borderColor: string;
  badgeBg: string;
}

const SPHERES: SphereConfig[] = [
  {
    sphere: "SPIRITUALITY",
    title: "Spirituality",
    description: "Spiritual discipline, daily prayers, and sacred reflections",
    icon: Sparkles,
    color: "text-purple-400",
    borderColor: "hover:border-purple-500/50",
    badgeBg: "bg-purple-950/40 text-purple-300 border-purple-800/40",
  },
  {
    sphere: "MENTAL",
    title: "Mental Discipline",
    description: "Daily planning, deep reading, strategy, and self-learning",
    icon: BookOpen,
    color: "text-[#00F0FF]",
    borderColor: "hover:border-[#00F0FF]/50",
    badgeBg: "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30",
  },
  {
    sphere: "PHYSICAL",
    title: "Physical Health",
    description: "Workouts, balanced nutrition, gym progression, and sleep",
    icon: Dumbbell,
    color: "text-rose-400",
    borderColor: "hover:border-rose-500/50",
    badgeBg: "bg-rose-950/40 text-rose-300 border-rose-800/40",
  },
  {
    sphere: "EMOTIONAL",
    title: "Emotional Harmony",
    description: "Daily preparedness, loving focus for Mushfa, and family bonds",
    icon: Heart,
    color: "text-pink-400",
    borderColor: "hover:border-pink-500/50",
    badgeBg: "bg-pink-950/40 text-pink-300 border-pink-800/40",
  },
  {
    sphere: "FINANCIAL",
    title: "Financial Discipline & Audit",
    description: "Daily spending ledger audit and expense discipline",
    icon: DollarSign,
    color: "text-emerald-400",
    borderColor: "hover:border-emerald-500/50",
    badgeBg: "bg-emerald-950/40 text-emerald-300 border-emerald-800/40",
  },
];

export default function ProtocolSettingsPage() {
  const queryClient = useQueryClient();
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedSphere, setSelectedSphere] = useState<ProtocolSphere>("SPIRITUALITY");
  const [itemToEdit, setItemToEdit] = useState<IProtocolItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<IProtocolItem | null>(null);

  const { data: items = [], isLoading } = useQuery<IProtocolItem[]>({
    queryKey: ["protocol-items"],
    queryFn: async () => {
      const res = await fetch("/api/protocol/items");
      const json = await res.json();
      return json.data || [];
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/protocol/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocol-items"] });
      queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (payload: { items: Array<{ id: string; order: number }> }) => {
      const res = await fetch("/api/protocol/items/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocol-items"] });
      queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
    },
  });

  const handleMove = (sphere: ProtocolSphere, currentIndex: number, direction: "up" | "down") => {
    const sphereItems = items
      .filter((i) => i.sphere === sphere)
      .sort((a, b) => a.order - b.order);

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sphereItems.length) return;

    const currentItem = sphereItems[currentIndex];
    const targetItem = sphereItems[targetIndex];

    const updated = [
      { id: currentItem._id.toString(), order: targetItem.order },
      { id: targetItem._id.toString(), order: currentItem.order },
    ];

    reorderMutation.mutate({ items: updated });
  };

  const handleOpenAdd = (sphere: ProtocolSphere) => {
    setSelectedSphere(sphere);
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEdit = (item: IProtocolItem) => {
    setItemToEdit(item);
    setSelectedSphere(item.sphere);
    setIsItemModalOpen(true);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "PRAYER_TRACKER":
        return (
          <span className="text-[9px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-700/50">
            5 Prayers
          </span>
        );
      case "WORKOUT_LOG":
        return (
          <span className="text-[9px] px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-700/50">
            Gym Log (+75 XP)
          </span>
        );
      case "FINANCIAL_AUDIT":
        return (
          <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/50">
            Expense Audit (₹)
          </span>
        );
      default:
        return (
          <span className="text-[9px] px-2 py-0.5 rounded bg-[#131620] text-[#94A3B8] border border-[#1F2435]">
            Checkbox
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-mono">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1F2435]">
        <div>
          <Link
            href="/settings"
            className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1.5 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Settings</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-[#00F0FF]" />
            DAILY PROTOCOL CONFIGURATION
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Configure, reorder, add, or disable activities across your 5 Living Spheres
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-[#64748B] text-xs gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#00F0FF]" />
          <span>LOADING PROTOCOL CONFIGURATION CONSOLE...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {SPHERES.map((s) => {
            const SphereIcon = s.icon;
            const sphereItems = items
              .filter((i) => i.sphere === s.sphere)
              .sort((a, b) => a.order - b.order);
            const activeCount = sphereItems.filter((i) => i.isActive).length;

            return (
              <div
                key={s.sphere}
                className={`hud-card p-4 sm:p-5 rounded-2xl border border-[#1F2435] ${s.borderColor} transition-all space-y-4`}
              >
                {/* Sphere Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2435] pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-[#131620] border border-[#1F2435] ${s.color}`}>
                      <SphereIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                          {s.title}
                        </h2>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${s.badgeBg}`}>
                          {activeCount} Active
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">{s.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenAdd(s.sphere)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131620] border border-[#1F2435] hover:border-[#00F0FF]/40 text-xs text-white hover:text-[#00F0FF] transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>Add Activity</span>
                  </button>
                </div>

                {/* Activities List */}
                {sphereItems.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#64748B] bg-[#050608] rounded-xl border border-dashed border-[#1F2435]">
                    No activities configured for this sphere. Click &ldquo;Add Activity&rdquo; to create one.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sphereItems.map((item, idx) => (
                      <div
                        key={item._id.toString()}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all gap-3 ${
                          item.isActive
                            ? "bg-[#050608] border-[#1F2435] hover:border-[#1F2435]/80"
                            : "bg-[#050608]/40 border-[#181B26] opacity-60"
                        }`}
                      >
                        {/* Left: Reorder arrows & Title Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Up / Down Controls */}
                          <div className="flex sm:flex-col gap-1 shrink-0">
                            <button
                              onClick={() => handleMove(s.sphere, idx, "up")}
                              disabled={idx === 0 || reorderMutation.isPending}
                              className="p-1 rounded bg-[#131620] border border-[#1F2435] text-[#94A3B8] hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMove(s.sphere, idx, "down")}
                              disabled={idx === sphereItems.length - 1 || reorderMutation.isPending}
                              className="p-1 rounded bg-[#131620] border border-[#1F2435] text-[#94A3B8] hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white truncate">
                                {item.title}
                              </span>
                              {getTypeBadge(item.type)}
                              {!item.isActive && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-800/40">
                                  Disabled
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Active Toggle Switch, Edit & Delete */}
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          {/* Active Toggle Switch */}
                          <label className="flex items-center gap-2 text-[10px] text-[#94A3B8] cursor-pointer select-none">
                            <span className="hidden xs:inline">
                              {item.isActive ? "Active" : "Disabled"}
                            </span>
                            <div className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.isActive}
                                onChange={() =>
                                  toggleStatusMutation.mutate({
                                    id: item._id.toString(),
                                    isActive: !item.isActive,
                                  })
                                }
                                className="sr-only peer"
                              />
                              <div className="w-8 h-4 bg-[#1F2435] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00F0FF]"></div>
                            </div>
                          </label>

                          <div className="h-4 w-px bg-[#1F2435]" />

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-[#131620] border border-[#1F2435] text-[#94A3B8] hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-colors cursor-pointer"
                            title="Edit Activity"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 rounded-lg bg-[#131620] border border-[#1F2435] text-[#94A3B8] hover:text-rose-400 hover:border-rose-400/40 transition-colors cursor-pointer"
                            title="Remove Activity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ProtocolItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        itemToEdit={itemToEdit}
        defaultSphere={selectedSphere}
      />

      <ProtocolDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        itemToDelete={itemToDelete}
      />
    </div>
  );
}

