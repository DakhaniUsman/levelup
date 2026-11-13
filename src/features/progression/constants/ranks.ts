export interface RankInfo {
  name: string;
  code: "E" | "D" | "C" | "B" | "A" | "S";
  title: string;
  minLevel: number;
  maxLevel: number;
  colorHex: string;
  borderColor: string;
}

export const RANKS: RankInfo[] = [
  {
    name: "E-Rank",
    code: "E",
    title: "Novice Hunter",
    minLevel: 1,
    maxLevel: 5,
    colorHex: "#94A3B8",
    borderColor: "border-[#94A3B8]/30",
  },
  {
    name: "D-Rank",
    code: "D",
    title: "Apprentice Hunter",
    minLevel: 6,
    maxLevel: 15,
    colorHex: "#0088FF",
    borderColor: "border-[#0088FF]/40",
  },
  {
    name: "C-Rank",
    code: "C",
    title: "Adept Hunter",
    minLevel: 16,
    maxLevel: 30,
    colorHex: "#00F0FF",
    borderColor: "border-[#00F0FF]/50",
  },
  {
    name: "B-Rank",
    code: "B",
    title: "Elite Hunter",
    minLevel: 31,
    maxLevel: 50,
    colorHex: "#10B981",
    borderColor: "border-[#10B981]/50",
  },
  {
    name: "A-Rank",
    code: "A",
    title: "Master Hunter",
    minLevel: 51,
    maxLevel: 75,
    colorHex: "#8A2BE2",
    borderColor: "border-[#8A2BE2]/60",
  },
  {
    name: "S-Rank",
    code: "S",
    title: "Shadow Sovereign",
    minLevel: 76,
    maxLevel: 999,
    colorHex: "#FFD700",
    borderColor: "border-[#FFD700]/70",
  },
];

/**
 * Returns the XP required to complete a given level:
 * XP = 1000 + (level - 1) * 250
 */
export function getXPRequiredForLevel(level: number): number {
  return 1000 + (Math.max(1, level) - 1) * 250;
}

export interface LevelCalculation {
  level: number;
  currentLevelXP: number;
  xpRequiredForNextLevel: number;
  progressPercent: number;
  totalLifetimeXP: number;
  rank: RankInfo;
}

/**
 * Calculates current level, level XP, progress percentage and rank based on lifetime XP
 */
export function calculateProgression(totalXP: number): LevelCalculation {
  const safeTotalXP = Math.max(0, totalXP);
  let remainingXP = safeTotalXP;
  let level = 1;

  while (true) {
    const requiredForThisLevel = getXPRequiredForLevel(level);
    if (remainingXP < requiredForThisLevel) {
      const progressPercent = Math.min(
        100,
        Math.round((remainingXP / requiredForThisLevel) * 100)
      );

      const rank =
        RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel) ||
        RANKS[RANKS.length - 1];

      return {
        level,
        currentLevelXP: remainingXP,
        xpRequiredForNextLevel: requiredForThisLevel,
        progressPercent,
        totalLifetimeXP: safeTotalXP,
        rank,
      };
    }
    remainingXP -= requiredForThisLevel;
    level++;
  }
}

