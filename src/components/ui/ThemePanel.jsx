"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useThemeContext, THEMES } from "@/contexts/AppThemeContext";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ThemePanel({ isOpen, onClose }) {
  const { themeId, setTheme } = useThemeContext();
  const c = useAppTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: 24, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed top-16 right-4 z-[70] w-72 rounded-2xl overflow-hidden"
            style={{
              background: c.surface,
              backdropFilter: "blur(24px)",
              border: `1px solid ${c.border}`,
              boxShadow: `0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px ${c.border}`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${c.border}` }}
            >
              <div>
                <h3
                  className="text-sm font-bold tracking-wide"
                  style={{ fontFamily: "var(--font-display)", color: c.text }}
                >
                  Theme Settings
                </h3>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: c.muted }}
                >
                  Choose your visual style
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: c.primaryBg, color: c.muted }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
              >
                <X size={13} />
              </motion.button>
            </div>

            {/* Theme cards */}
            <div className="p-4 flex flex-col gap-2.5">
              {Object.values(THEMES).map((t) => {
                const isActive = themeId === t.id;

                return (
                  <motion.button
                    key={t.id}
                    id={`theme-option-${t.id}`}
                    onClick={() => { setTheme(t.id); onClose(); }}
                    className="relative flex items-center gap-4 p-3.5 rounded-xl text-left w-full"
                    style={{
                      background: isActive ? c.primaryBg : "transparent",
                      border: `1px solid ${isActive ? c.primaryBorder : c.border}`,
                      boxShadow: isActive
                        ? `0 0 0 1px ${c.primaryBorder}, inset 0 0 24px ${c.primaryGlow}`
                        : "none",
                      transition: "all 0.15s ease",
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Color swatches preview */}
                    <div className="flex gap-1 shrink-0">
                      {t.preview.map((color, i) => (
                        <div
                          key={i}
                          className="rounded-full"
                          style={{
                            width: i === 0 ? 18 : 14,
                            height: i === 0 ? 18 : 14,
                            background: color,
                            marginTop: i === 1 ? 2 : 0,
                            boxShadow: i === 0 ? `0 0 8px ${color}55` : "none",
                            border: `1px solid rgba(255,255,255,0.1)`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-sm font-semibold"
                          style={{
                            fontFamily: "var(--font-display)",
                            color: isActive ? c.primary : c.text,
                          }}
                        >
                          {t.name}
                        </span>
                        <span className="text-xs" style={{ color: c.subtle }}>
                          {t.icon}
                        </span>
                      </div>
                      <span
                        className="text-xs block mt-0.5"
                        style={{ color: c.muted }}
                      >
                        {t.description}
                      </span>
                    </div>

                    {/* Active checkmark */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: c.primary }}
                        >
                          <Check size={11} color={c.checkStroke} strokeWidth={2.5} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer note */}
            <div
              className="px-5 py-3 text-center"
              style={{ borderTop: `1px solid ${c.border}` }}
            >
              <span className="text-[10px]" style={{ color: c.subtle, letterSpacing: "0.08em" }}>
                THEME PREFERENCE IS SAVED LOCALLY
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
