"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const c = useAppTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";

  return (
    <motion.button
      id="theme-toggle"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
      style={{
        background: c.primaryBg,
        border: `1px solid ${c.primaryBorder}`,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 30, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            <Moon size={15} color={c.primary} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -30, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            <Sun size={15} color={c.primary} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
