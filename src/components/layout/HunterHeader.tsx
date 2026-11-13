"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Zap,
  Award,
  Bell,
  Check,
  Trophy,
  Flame,
  Sparkles,
  Info,
  Menu,
  Shield,
} from "lucide-react";
import { ProgressionStats } from "@/features/progression/services/xp.service";
import { SafeUser } from "@/features/auth/services/auth.service";
import { INotification } from "@/models/Notification";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/ui-store";

const NOTIF_ICONS = {
  ACHIEVEMENT: Trophy,
  STREAK: Flame,
  LEVEL_UP: Sparkles,
  SYSTEM: Info,
};

export default function HunterHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toggleMobileNav } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery<SafeUser>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: stats } = useQuery<ProgressionStats>({
    queryKey: ["progression-stats"],
    queryFn: async () => {
      const res = await fetch("/api/progression/stats");
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 15000,
  });

  const { data: notifData } = useQuery<{
    notifications: INotification[];
    unreadCount: number;
  }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      return json.data || { notifications: [], unreadCount: 0 };
    },
    refetchInterval: 10000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/notifications/read-all`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const level = stats?.level || 1;
  const progressPercent = stats?.progressPercent || 0;
  const rank = stats?.rank?.name || "E-Rank";
  const rankColor = stats?.rank?.colorHex || "#94A3B8";
  const unreadCount = notifData?.unreadCount || 0;
  const notifications = notifData?.notifications || [];

  return (
    <header className="h-16 shrink-0 bg-[#090A0F]/90 backdrop-blur-md border-b border-[#1F2435] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Mobile Hamburger + Hunter HUD stats indicator */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileNav}
          className="lg:hidden p-2 rounded-lg bg-[#131620] border border-[#1F2435] text-[#94A3B8] hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Mobile Brand Shield */}
        <div className="lg:hidden flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-md bg-[#131620] border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF]">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-mono font-bold text-xs text-white hidden xs:inline">
            LEVEL <span className="text-[#00F0FF]">UP</span>
          </span>
        </div>

        {/* Rank Badge */}
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-sm"
          style={{
            borderColor: `${rankColor}40`,
            backgroundColor: `${rankColor}10`,
            color: rankColor,
          }}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{rank}</span>
        </div>

        {/* Level and XP Bar */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-white">
            LVL <span className="text-[#00F0FF]">{level}</span>
          </div>

          <div className="w-24 sm:w-36 bg-[#131620] h-2 rounded-full overflow-hidden border border-[#1F2435] relative">
            <div
              className="bg-gradient-to-r from-[#0088FF] to-[#00F0FF] h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="text-[10px] font-mono text-[#94A3B8]">
            {progressPercent}%
          </span>
        </div>

        {/* Today's XP badge */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#131620] border border-[#1F2435] text-xs font-mono text-[#00F0FF]">
          <Zap className="w-3.5 h-3.5 fill-[#00F0FF]/30" />
          <span>+{stats?.todayXP || 0} XP Today</span>
        </div>
      </div>

      {/* User profile, Notifications & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-[#131620] border border-[#1F2435] text-[#94A3B8] hover:text-[#00F0FF] hover:border-[#00F0FF]/40 transition-all relative cursor-pointer"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00F0FF] text-[#090A0F] font-mono font-bold text-[9px] flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-96 hud-card rounded-2xl border border-[#1F2435] shadow-2xl p-4 z-50 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#1F2435]">
                <div className="font-bold text-white flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span>SYSTEM ALERTS</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className="text-[10px] text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="mt-2 max-h-72 overflow-y-auto space-y-2 divide-y divide-[#1F2435]/40">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-[#64748B] text-xs">
                    No system alerts recorded.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = NOTIF_ICONS[n.type] || Info;
                    return (
                      <div
                        key={n._id.toString()}
                        className={cn(
                          "pt-2 flex items-start gap-3 p-2 rounded-lg transition-colors cursor-pointer",
                          !n.isRead ? "bg-[#00F0FF]/5" : "hover:bg-[#131620]"
                        )}
                        onClick={() => {
                          if (!n.isRead) markReadMutation.mutate(n._id.toString());
                          if (n.link) {
                            router.push(n.link);
                            setIsOpen(false);
                          }
                        }}
                      >
                        <div className="p-1.5 rounded bg-[#131620] border border-[#1F2435] text-[#00F0FF] shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">
                            {n.title}
                          </div>
                          <p className="text-[11px] text-[#94A3B8] font-sans mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[9px] text-[#64748B] mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#00F0FF] shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-xs font-mono font-semibold text-white">
            {user?.displayName || user?.username || "Hunter"}
          </div>
          <div className="text-[10px] font-mono text-[#64748B]">
            @{user?.username || "hunter"}
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Disconnect Session"
          className="p-2 rounded-lg bg-[#131620] border border-[#1F2435] text-[#94A3B8] hover:text-[#FF2A55] hover:border-[#FF2A55]/40 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
