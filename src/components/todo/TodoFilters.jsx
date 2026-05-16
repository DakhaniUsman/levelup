"use client";

import { motion } from "framer-motion";
import { FILTERS } from "@/lib/constants";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function TodoFilters({ activeFilter, onFilterChange, counts }) {
  const c = useAppTheme();

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className="flex items-center gap-1 p-1 rounded-xl"
        style={{
          background: c.primaryBg,
          border: `1px solid ${c.border}`,
        }}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          const count = counts?.[filter.key] ?? 0;

          return (
            <motion.button
              key={filter.key}
              id={`filter-${filter.key}`}
              onClick={() => onFilterChange(filter.key)}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold"
              style={{
                fontFamily: "var(--font-display)",
                color: isActive ? c.primary : `${c.muted}88`,
                letterSpacing: "0.02em",
              }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Animated active indicator */}
              {isActive && (
                <motion.div
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: c.primaryBg,
                    border: `1px solid ${c.primaryBorder}`,
                    boxShadow: `0 0 16px ${c.primaryGlow}`,
                  }}
                  transition={{ type: "spring", stiffness: 420, damping: 38 }}
                />
              )}

              <span className="relative z-10">{filter.label}</span>

              {count > 0 && (
                <span
                  className="relative z-10 min-w-[1.2rem] text-center rounded-full text-[10px] font-bold px-1.5 py-0.5 leading-tight"
                  style={{
                    background: isActive ? c.primaryBorder : c.border,
                    color: isActive ? c.primary : c.subtle,
                  }}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
