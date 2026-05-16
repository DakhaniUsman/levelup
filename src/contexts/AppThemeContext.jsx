"use client";

import { createContext, useContext, useState, useEffect } from "react";

// ─── Theme Definitions ────────────────────────────────────────────────────────

export const THEMES = {
  neon: {
    id: "neon",
    name: "Neon",
    icon: "⚡",
    description: "Electric cyan & magenta",
    preview: ["#00eeff", "#c50b9c", "#081c29"],

    // dark
    bg: "#081c29",
    surface: "rgba(13,37,56,0.72)",
    surfaceSolid: "#0d2538",
    border: "rgba(26,58,82,0.85)",
    primary: "#00eeff",
    primaryGlow: "rgba(0,238,255,0.22)",
    primaryBg: "rgba(0,238,255,0.08)",
    primaryBorder: "rgba(0,238,255,0.28)",
    secondary: "#c50b9c",
    secondaryGlow: "rgba(197,11,156,0.22)",
    text: "#ffffff",
    muted: "#7ba8c4",
    subtle: "rgba(58,104,130,0.75)",
    gradient: "linear-gradient(135deg, #00eeff, #c50b9c)",
    checkBg: "linear-gradient(135deg, #00eeff, #00c4d4)",
    checkStroke: "#081c29",
    inputFocus: "0 0 0 1px rgba(0,238,255,0.45), 0 0 28px rgba(0,238,255,0.14)",
    navBg: "rgba(8,28,41,0.88)",
    navBorder: "rgba(26,58,82,0.65)",

    // light
    bgLight: "#f0f8ff",
    surfaceLight: "rgba(255,255,255,0.82)",
    surfaceSolidLight: "#ffffff",
    borderLight: "rgba(203,213,225,0.85)",
    primaryLight: "#0099aa",
    textLight: "#0d1117",
    mutedLight: "#475569",
    subtleLight: "#94a3b8",
    navBgLight: "rgba(240,248,255,0.9)",
    navBorderLight: "rgba(203,213,225,0.6)",

    priority: {
      high:   { color: "#ff4757", bg: "rgba(255,71,87,0.1)",   border: "rgba(255,71,87,0.35)",  text: "#ff6b78" },
      medium: { color: "#ffa502", bg: "rgba(255,165,2,0.1)",   border: "rgba(255,165,2,0.35)",  text: "#ffb730" },
      low:    { color: "#00eeff", bg: "rgba(0,238,255,0.07)", border: "rgba(0,238,255,0.25)",  text: "#00eeff" },
    },
  },

  futuristic: {
    id: "futuristic",
    name: "Futuristic",
    icon: "◈",
    description: "Deep violet & space",
    preview: ["#7c3aed", "#06b6d4", "#080812"],

    bg: "#080812",
    surface: "rgba(15,15,35,0.82)",
    surfaceSolid: "#0f0f23",
    border: "rgba(124,58,237,0.22)",
    primary: "#7c3aed",
    primaryGlow: "rgba(124,58,237,0.28)",
    primaryBg: "rgba(124,58,237,0.1)",
    primaryBorder: "rgba(124,58,237,0.32)",
    secondary: "#06b6d4",
    secondaryGlow: "rgba(6,182,212,0.22)",
    text: "#e8e8ff",
    muted: "#8b8bc8",
    subtle: "rgba(100,80,200,0.5)",
    gradient: "linear-gradient(135deg, #7c3aed, #06b6d4)",
    checkBg: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    checkStroke: "#e8e8ff",
    inputFocus: "0 0 0 1px rgba(124,58,237,0.5), 0 0 28px rgba(124,58,237,0.18)",
    navBg: "rgba(8,8,18,0.9)",
    navBorder: "rgba(124,58,237,0.2)",

    bgLight: "#f5f3ff",
    surfaceLight: "rgba(255,255,255,0.85)",
    surfaceSolidLight: "#ffffff",
    borderLight: "rgba(167,139,250,0.3)",
    primaryLight: "#6d28d9",
    textLight: "#1e0060",
    mutedLight: "#5b21b6",
    subtleLight: "#7c3aed",
    navBgLight: "rgba(245,243,255,0.92)",
    navBorderLight: "rgba(167,139,250,0.35)",

    priority: {
      high:   { color: "#f43f5e", bg: "rgba(244,63,94,0.1)",  border: "rgba(244,63,94,0.35)",  text: "#fb7185" },
      medium: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)",border: "rgba(167,139,250,0.3)", text: "#a78bfa" },
      low:    { color: "#06b6d4", bg: "rgba(6,182,212,0.07)", border: "rgba(6,182,212,0.25)", text: "#22d3ee" },
    },
  },

  mono: {
    id: "mono",
    name: "Mono",
    icon: "◻",
    description: "Clean & minimal",
    preview: ["#ffffff", "#888888", "#0f0f0f"],

    bg: "#0f0f0f",
    surface: "rgba(22,22,22,0.88)",
    surfaceSolid: "#161616",
    border: "rgba(255,255,255,0.07)",
    primary: "#ffffff",
    primaryGlow: "rgba(255,255,255,0.08)",
    primaryBg: "rgba(255,255,255,0.05)",
    primaryBorder: "rgba(255,255,255,0.15)",
    secondary: "#666666",
    secondaryGlow: "rgba(150,150,150,0.1)",
    text: "#ffffff",
    muted: "#888888",
    subtle: "rgba(100,100,100,0.55)",
    gradient: "linear-gradient(135deg, #ffffff 0%, #888888 100%)",
    checkBg: "linear-gradient(135deg, #ffffff, #cccccc)",
    checkStroke: "#0f0f0f",
    inputFocus: "0 0 0 1px rgba(255,255,255,0.22), 0 0 20px rgba(255,255,255,0.05)",
    navBg: "rgba(10,10,10,0.92)",
    navBorder: "rgba(255,255,255,0.06)",

    bgLight: "#f8f8f8",
    surfaceLight: "rgba(255,255,255,0.9)",
    surfaceSolidLight: "#ffffff",
    borderLight: "rgba(0,0,0,0.09)",
    primaryLight: "#111111",
    textLight: "#0f0f0f",
    mutedLight: "#555555",
    subtleLight: "#aaaaaa",
    navBgLight: "rgba(248,248,248,0.95)",
    navBorderLight: "rgba(0,0,0,0.08)",

    priority: {
      high:   { color: "#ffffff", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.2)",  text: "#ffffff" },
      medium: { color: "#aaaaaa", bg: "rgba(170,170,170,0.07)", border: "rgba(170,170,170,0.2)", text: "#cccccc" },
      low:    { color: "#555555", bg: "rgba(85,85,85,0.07)",    border: "rgba(85,85,85,0.18)",   text: "#888888" },
    },
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AppThemeContext = createContext(null);

export function AppThemeProvider({ children }) {
  const [themeId, setThemeId] = useState("neon");

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("levelup-theme");
    if (saved && THEMES[saved]) setThemeId(saved);
  }, []);

  const setTheme = (id) => {
    if (!THEMES[id]) return;
    setThemeId(id);
    localStorage.setItem("levelup-theme", id);
  };

  return (
    <AppThemeContext.Provider
      value={{ themeId, currentTheme: THEMES[themeId], setTheme, themes: THEMES }}
    >
      {children}
    </AppThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within AppThemeProvider");
  return ctx;
}
