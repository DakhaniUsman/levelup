"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  Flame,
  CheckSquare,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BOTTOM_NAV_ITEMS = [
  { label: "HUD", href: "/dashboard", icon: LayoutDashboard },
  { label: "Quests", href: "/quests", icon: Swords },
  { label: "Habits", href: "/habits", icon: Flame },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Rank", href: "/progression", icon: TrendingUp },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090A0F]/95 backdrop-blur-xl border-t border-[#1F2435] px-1 py-1 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative font-mono",
              isActive
                ? "text-[#00F0FF]"
                : "text-[#64748B] hover:text-[#94A3B8]"
            )}
          >
            {isActive && (
              <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            )}
            <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]")} />
            <span className="text-[10px] font-bold mt-0.5 tracking-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

