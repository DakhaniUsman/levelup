"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  X,
  AlertTriangle,
  Flame,
  Award,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { INotification } from "@/models/Notification";

export default function HUDNotificationToast() {
  const queryClient = useQueryClient();
  const [activeToast, setActiveToast] = useState<INotification | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  // Polling unread notifications every 30 seconds
  const { data } = useQuery<{ notifications: INotification[]; unreadCount: number }>({
    queryKey: ["notifications-live"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return { notifications: [], unreadCount: 0 };
      const json = await res.json();
      return json.data || { notifications: [], unreadCount: 0 };
    },
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications-live"] });
    },
  });

  useEffect(() => {
    if (data?.notifications && data.notifications.length > 0) {
      // Find the first unread notification that hasn't been shown in toast this session
      const unreadList = data.notifications.filter(
        (n) => !n.isRead && !seenIds.has(n._id.toString())
      );

      if (unreadList.length > 0) {
        const top = unreadList[0];
        setActiveToast(top);
        setSeenIds((prev) => new Set([...prev, top._id.toString()]));

        // Auto dismiss after 8 seconds
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 8000);

        return () => clearTimeout(timer);
      }
    }
  }, [data, seenIds]);

  if (!activeToast) return null;

  const isWarning =
    activeToast.type === "SYSTEM" &&
    (activeToast.title.includes("WARNING") ||
      activeToast.title.includes("PENALTY") ||
      activeToast.title.includes("DEADLINE"));

  const handleDismiss = () => {
    markReadMutation.mutate(activeToast._id.toString());
    setActiveToast(null);
  };

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div
        className={`hud-card p-4 rounded-xl border shadow-2xl font-mono text-xs backdrop-blur-md relative overflow-hidden ${
          isWarning
            ? "border-rose-500/70 bg-[#0F080C]/95 shadow-[0_0_25px_rgba(244,63,94,0.35)]"
            : "border-[#00F0FF]/60 bg-[#090A0F]/95 shadow-[0_0_25px_rgba(0,240,255,0.25)]"
        }`}
      >
        {/* Glow bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] ${
            isWarning
              ? "bg-gradient-to-r from-transparent via-rose-500 to-transparent"
              : "bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent"
          }`}
        />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg border ${
                isWarning
                  ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                  : "bg-[#00F0FF]/10 border-[#00F0FF]/40 text-[#00F0FF]"
              }`}
            >
              {isWarning ? (
                <ShieldAlert className="w-4 h-4 animate-pulse" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isWarning ? "text-rose-400" : "text-[#00F0FF]"
              }`}
            >
              {activeToast.title}
            </span>
          </div>

          <button
            onClick={handleDismiss}
            className="text-[#64748B] hover:text-white transition-colors p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="mt-2 text-slate-300 leading-relaxed text-[11px]">
          {activeToast.message}
        </p>

        {activeToast.link && (
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#1F2435]">
            <Link
              href={activeToast.link}
              onClick={handleDismiss}
              className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase hover:underline ${
                isWarning ? "text-rose-400" : "text-[#00F0FF]"
              }`}
            >
              <span>View Directive</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span className="text-[9px] text-[#64748B]">HUNTER SYSTEM ALERT</span>
          </div>
        )}
      </div>
    </div>
  );
}
