import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Achievement, { IAchievement } from "@/models/Achievement";
import UserAchievement, { IUserAchievement } from "@/models/UserAchievement";
import QuestCompletion from "@/models/QuestCompletion";
import Habit from "@/models/Habit";
import Bookmark from "@/models/Bookmark";
import { XPService } from "@/features/progression/services/xp.service";
import { NotificationService } from "@/features/notifications/services/notification.service";

const SEED_ACHIEVEMENTS = [
  {
    code: "FIRST_QUEST",
    name: "First Blood",
    description: "Complete your first daily quest trial in the System.",
    icon: "Swords",
    category: "QUESTS",
    xpReward: 50,
    rarity: "COMMON",
  },
  {
    code: "QUEST_10",
    name: "Trial Veteran",
    description: "Complete 10 daily quest trials successfully.",
    icon: "Shield",
    category: "QUESTS",
    xpReward: 100,
    rarity: "RARE",
  },
  {
    code: "QUEST_50",
    name: "Sovereign Hunter",
    description: "Conquer 50 daily quest trials.",
    icon: "Trophy",
    category: "QUESTS",
    xpReward: 300,
    rarity: "EPIC",
  },
  {
    code: "FIRST_HABIT",
    name: "Path of Discipline",
    description: "Preserve your first habit directive.",
    icon: "Flame",
    category: "DISCIPLINE",
    xpReward: 50,
    rarity: "COMMON",
  },
  {
    code: "STREAK_7",
    name: "Unbroken Will",
    description: "Maintain a 7-day habit streak.",
    icon: "Zap",
    category: "STREAKS",
    xpReward: 150,
    rarity: "RARE",
  },
  {
    code: "STREAK_30",
    name: "Iron Determination",
    description: "Maintain a 30-day unbroken habit streak.",
    icon: "Crown",
    category: "STREAKS",
    xpReward: 500,
    rarity: "EPIC",
  },
  {
    code: "KNOWLEDGE_10",
    name: "Apprentice Scholar",
    description: "Archive 10 valuable codex resources.",
    icon: "BookOpen",
    category: "KNOWLEDGE",
    xpReward: 75,
    rarity: "COMMON",
  },
  {
    code: "LEVEL_10",
    name: "Power Awakening",
    description: "Ascend to Hunter Level 10.",
    icon: "Sparkles",
    category: "LEVELS",
    xpReward: 200,
    rarity: "RARE",
  },
];

export interface AchievementWithStatus extends Omit<IAchievement, "_id"> {
  _id: Types.ObjectId;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export class AchievementService {
  static async seedAchievements(): Promise<void> {
    await dbConnect();
    const count = await Achievement.countDocuments();
    if (count === 0) {
      await Achievement.insertMany(SEED_ACHIEVEMENTS);
    }
  }

  static async getUserAchievements(
    userId: string | Types.ObjectId
  ): Promise<AchievementWithStatus[]> {
    await dbConnect();
    await this.seedAchievements();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const [achievements, userUnlocked] = await Promise.all([
      Achievement.find().sort({ xpReward: 1 }).lean(),
      UserAchievement.find({ userId: userObjId }).lean(),
    ]);

    const unlockMap = new Map<string, IUserAchievement>(
      userUnlocked.map((u) => [u.achievementId.toString(), u])
    );

    return achievements.map((a) => {
      const unlock = unlockMap.get(a._id.toString());
      return {
        ...a,
        isUnlocked: Boolean(unlock),
        unlockedAt: unlock?.unlockedAt,
      };
    }) as unknown as AchievementWithStatus[];
  }

  /**
   * Scans user progress and claims any newly qualified achievements.
   */
  static async checkAndUnlockAchievements(
    userId: string | Types.ObjectId
  ): Promise<{ unlockedCount: number; newlyUnlocked: string[] }> {
    await dbConnect();
    await this.seedAchievements();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    // Gather user metrics
    const [
      questCompletionsCount,
      habits,
      bookmarksCount,
      progressionStats,
      alreadyUnlocked,
      allAchievements,
    ] = await Promise.all([
      QuestCompletion.countDocuments({ userId: userObjId }),
      Habit.find({ userId: userObjId }).lean(),
      Bookmark.countDocuments({ userId: userObjId, isArchived: false }),
      XPService.getProgressionStats(userObjId),
      UserAchievement.find({ userId: userObjId }).lean(),
      Achievement.find().lean(),
    ]);

    const unlockedCodes = new Set<string>();
    const achievementMap = new Map<string, IAchievement>();
    for (const a of allAchievements) {
      achievementMap.set(a.code, a);
    }

    const alreadyUnlockedIds = new Set(
      alreadyUnlocked.map((u) => u.achievementId.toString())
    );

    const maxStreak = habits.reduce(
      (max, h) => Math.max(max, h.longestStreak || 0, h.currentStreak || 0),
      0
    );

    const checkCondition = (code: string): boolean => {
      switch (code) {
        case "FIRST_QUEST":
          return questCompletionsCount >= 1;
        case "QUEST_10":
          return questCompletionsCount >= 10;
        case "QUEST_50":
          return questCompletionsCount >= 50;
        case "FIRST_HABIT":
          return habits.some((h) => h.longestStreak >= 1 || h.currentStreak >= 1);
        case "STREAK_7":
          return maxStreak >= 7;
        case "STREAK_30":
          return maxStreak >= 30;
        case "KNOWLEDGE_10":
          return bookmarksCount >= 10;
        case "LEVEL_10":
          return progressionStats.level >= 10;
        default:
          return false;
      }
    };

    const newlyUnlocked: string[] = [];

    for (const a of allAchievements) {
      if (!alreadyUnlockedIds.has(a._id.toString())) {
        if (checkCondition(a.code)) {
          // Unlock achievement!
          await UserAchievement.create({
            userId: userObjId,
            achievementId: a._id,
            unlockedAt: new Date(),
          });

          // Award XP
          await XPService.awardXP({
            userId: userObjId,
            amount: a.xpReward,
            sourceType: "MANUAL_ADJUSTMENT",
            sourceId: `ACHIEVEMENT:${a._id.toString()}`,
            description: `Achievement Unlocked: ${a.name} (+${a.xpReward} XP)`,
          });

          // Send notification
          await NotificationService.createNotification(userObjId, {
            title: `🏆 Achievement Unlocked: ${a.name}`,
            message: `${a.description} (+${a.xpReward} XP awarded)`,
            type: "ACHIEVEMENT",
            link: "/progression",
          });

          newlyUnlocked.push(a.name);
        }
      }
    }

    return {
      unlockedCount: newlyUnlocked.length,
      newlyUnlocked,
    };
  }
}

