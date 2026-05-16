"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useThemeContext } from "@/contexts/AppThemeContext";

/**
 * Returns the current theme token set merged with dark/light mode.
 * All components should use this instead of hardcoded isDark + color strings.
 */
export function useAppTheme() {
  const { currentTheme } = useThemeContext();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = !mounted || theme === "dark";
  const t = currentTheme;

  return {
    // Meta
    themeId: t.id,
    isDark,
    mounted,

    // Backgrounds
    bg:      isDark ? t.bg      : t.bgLight,
    surface: isDark ? t.surface : t.surfaceLight,
    surfaceSolid: isDark ? t.surfaceSolid : t.surfaceSolidLight,

    // Borders
    border:  isDark ? t.border  : t.borderLight,

    // Brand colors
    primary:       isDark ? t.primary       : t.primaryLight,
    primaryGlow:   t.primaryGlow,
    primaryBg:     t.primaryBg,
    primaryBorder: t.primaryBorder,
    secondary:     t.secondary,
    secondaryGlow: t.secondaryGlow,
    gradient:      t.gradient,

    // Checkbox
    checkBg:     t.checkBg,
    checkStroke: t.checkStroke,

    // Input focus
    inputFocus: t.inputFocus,

    // Nav
    navBg:     isDark ? t.navBg     : t.navBgLight,
    navBorder: isDark ? t.navBorder : t.navBorderLight,

    // Text
    text:   isDark ? t.text   : t.textLight,
    muted:  isDark ? t.muted  : t.mutedLight,
    subtle: isDark ? t.subtle : t.subtleLight,

    // Priorities
    priorities: t.priority,

    // Raw theme for edge cases
    raw: t,
  };
}
