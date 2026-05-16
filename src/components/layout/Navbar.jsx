"use client";

import { motion } from "framer-motion";
import { Zap, Palette } from "lucide-react";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import ThemePanel from "@/components/ui/ThemePanel";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function Navbar() {
  const c = useAppTheme();
  const [scrolled, setScrolled] = useState(false);
  const [themePanelOpen, setThemePanelOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        id="main-navbar"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex items-center justify-between transition-all duration-300"
        style={{
          background: scrolled ? c.navBg : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: `1px solid ${scrolled ? c.navBorder : "transparent"}`,
        }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer select-none"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: c.primaryBg,
              border: `1px solid ${c.primaryBorder}`,
            }}
          >
            <Zap size={16} color={c.primary} fill={c.primary} />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              background: c.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            LevelUp
          </span>
        </motion.div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Step badge */}
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full hidden sm:block"
            style={{
              background: c.primaryBg,
              color: `${c.primary}bb`,
              border: `1px solid ${c.primaryBorder}`,
              fontFamily: "var(--font-display)",
              letterSpacing: "0.06em",
            }}
          >
            STEP 01 — TODO
          </span>

          {/* Theme picker */}
          <motion.button
            id="theme-picker-btn"
            aria-label="Open theme settings"
            onClick={() => setThemePanelOpen((v) => !v)}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
            style={{
              background: themePanelOpen ? c.primaryBg : "transparent",
              border: `1px solid ${themePanelOpen ? c.primaryBorder : c.border}`,
              transition: "all 0.2s",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Palette size={15} color={themePanelOpen ? c.primary : c.muted} />
          </motion.button>

          <ThemeToggle />
        </div>
      </motion.nav>

      <ThemePanel isOpen={themePanelOpen} onClose={() => setThemePanelOpen(false)} />
    </>
  );
}
