"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  Flame,
  CheckSquare,
  BookOpen,
  TrendingUp,
  Settings,
  Shield,
  Terminal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/ui-store";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: "Daily Quests",
    href: "/quests",
    icon: Swords,
    badge: "DAILY",
  },
  {
    label: "Habit Protocol",
    href: "/habits",
    icon: Flame,
    badge: "STREAK",
  },
  {
    label: "Task Engine",
    href: "/tasks",
    icon: CheckSquare,
    badge: null,
  },
  {
    label: "Knowledge Archive",
    href: "/knowledge",
    icon: BookOpen,
    badge: null,
  },
  {
    label: "Progression & Ledger",
    href: "/progression",
    icon: TrendingUp,
    badge: "XP",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

export default function HunterSidebar() {
  const pathname = usePathname();
  const { isMobileNavOpen, closeMobileNav } = useUIStore();

  const renderNav = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand header */}
        <div className="p-5 sm:p-6 border-b border-[#1F2435] flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={() => isMobile && closeMobileNav()}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#131620] border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] group-hover:border-[#00F0FF] group-hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono font-extrabold text-base tracking-wider text-white">
                LEVEL <span className="text-[#00F0FF]">UP</span>
              </span>
              <span className="block text-[10px] font-mono text-[#64748B] tracking-widest uppercase">
                Life OS v2.0
              </span>
            </div>
          </Link>

          {isMobile && (
            <button
              onClick={closeMobileNav}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#131620] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && closeMobileNav()}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all group",
                  isActive
                    ? "bg-[#131620] text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)] font-semibold"
                    : "text-[#94A3B8] hover:text-white hover:bg-[#131620]/60 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-[#00F0FF]"
                        : "text-[#64748B] group-hover:text-white"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                      isActive
                        ? "bg-[#00F0FF]/20 text-[#00F0FF]"
                        : "bg-[#1F2435] text-[#94A3B8]"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 m-4 rounded-xl bg-[#131620] border border-[#1F2435] text-[11px] font-mono space-y-2">
        <div className="flex items-center justify-between text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SYSTEM ONLINE
          </span>
          <Terminal className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] text-[#94A3B8] leading-tight">
          &ldquo;Become 1% better every day.&rdquo;
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-[#090A0F] border-r border-[#1F2435] flex-col justify-between h-screen sticky top-0">
        {renderNav(false)}
      </aside>

      {/* 2. Mobile Drawer Backdrop & Slide-out Menu */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={closeMobileNav}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#090A0F] border-r border-[#1F2435] z-50 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-200">
            {renderNav(true)}
          </aside>
        </div>
      )}
    </>
  );
}
