import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import XPTransaction, {
  IXPTransaction,
  XPSourceType,
  XPTransactionType,
} from "@/models/XPTransaction";
import {
  calculateProgression,
  LevelCalculation,
} from "../constants/ranks";
import { AccountabilityService } from "@/features/notifications/services/accountability.service";
import { CacheService } from "@/lib/cache.service";

export interface AwardXPParams {
  userId: string | Types.ObjectId;
  amount: number;
  sourceType: XPSourceType;
  sourceId: string;
  description: string;
  transactionType?: XPTransactionType;
}

export interface ProgressionStats extends LevelCalculation {
  todayXP: number;
  totalTransactions: number;
}

export class XPService {
  /**
   * Idempotently awards XP. If an idempotencyKey already exists,
   * it returns the existing transaction and awards no duplicate XP.
   */
  static async awardXP(params: AwardXPParams): Promise<{
    transaction: IXPTransaction;
    isNewReward: boolean;
  }> {
    await dbConnect();

    const userObjId =
      typeof params.userId === "string"
        ? new Types.ObjectId(params.userId)
        : params.userId;

    const idempotencyKey = `${params.sourceType}:${params.sourceId}:${userObjId.toString()}`;

    // Check if already awarded
    const existing = await XPTransaction.findOne({ idempotencyKey });
    if (existing) {
      return { transaction: existing, isNewReward: false };
    }

    // Measure pre-award lifetime XP for level up detection
    const prevAggregate = await XPTransaction.aggregate([
      { $match: { userId: userObjId } },
      { $group: { _id: null, totalXP: { $sum: "$amount" } } },
    ]);
    const prevXP = prevAggregate[0]?.totalXP || 0;

    try {
      const transaction = await XPTransaction.create({
        userId: userObjId,
        amount: params.amount,
        transactionType: params.transactionType || "REWARD",
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        idempotencyKey,
        description: params.description,
      });

      // Check for Level Up and Rank Advancement
      const newXP = prevXP + params.amount;
      const prevProg = calculateProgression(prevXP);
      const newProg = calculateProgression(newXP);

      if (newProg.level > prevProg.level) {
        AccountabilityService.dispatchAlert({
          userId: userObjId,
          dedupeKey: `level_up_${newProg.level}_${userObjId.toString()}`,
          category: "progression",
          title: `HUNTER ASCENSION: LEVEL ${newProg.level}!`,
          message: `System Alert: Hunter level increased to ${newProg.level}. Next milestone: Level ${newProg.level + 1}.`,
          url: "/progression",
          type: "LEVEL_UP",
          bypassQuietHours: true,
        }).catch((e: any) => console.error("Level up alert error:", e.message));
      }

      if (newProg.rank.code !== prevProg.rank.code) {
        AccountabilityService.dispatchAlert({
          userId: userObjId,
          dedupeKey: `rank_up_${newProg.rank.code}_${userObjId.toString()}`,
          category: "progression",
          title: `RANK ADVANCEMENT: ${newProg.rank.name.toUpperCase()}!`,
          message: `The System has acknowledged your power. You have ascended to ${newProg.rank.name} (${newProg.rank.title})!`,
          url: "/progression",
          type: "LEVEL_UP",
          bypassQuietHours: true,
        }).catch((e: any) => console.error("Rank up alert error:", e.message));
      }

      // Invalidate progression and dashboard cache
      await CacheService.invalidateProgression(userObjId.toString());

      return { transaction, isNewReward: true };
    } catch (error: unknown) {
      // In case of race condition on unique index
      if (
        error instanceof Error &&
        error.message.includes("E11000 duplicate key")
      ) {
        const raceExisting = await XPTransaction.findOne({ idempotencyKey });
        if (raceExisting) {
          return { transaction: raceExisting, isNewReward: false };
        }
      }
      throw error;
    }
  }

  /**
   * Calculates real-time progression statistics based on XP ledger
   */
  static async getProgressionStats(
    userId: string | Types.ObjectId
  ): Promise<ProgressionStats> {
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;
    const cacheKey = CacheService.keys.progression(userObjId.toString());

    return CacheService.getOrSet(cacheKey, async () => {
      await dbConnect();

      // Aggregate lifetime XP
      const lifetimeAggregate = await XPTransaction.aggregate([
        { $match: { userId: userObjId } },
        {
          $group: {
            _id: null,
            totalXP: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);

      const totalXP = lifetimeAggregate[0]?.totalXP || 0;
      const totalTransactions = lifetimeAggregate[0]?.count || 0;

      // Calculate today's XP (UTC midnight start of current day)
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);

      const todayAggregate = await XPTransaction.aggregate([
        {
          $match: {
            userId: userObjId,
            createdAt: { $gte: startOfToday },
          },
        },
        {
          $group: {
            _id: null,
            todayXP: { $sum: "$amount" },
          },
        },
      ]);

      const todayXP = todayAggregate[0]?.todayXP || 0;
      const progression = calculateProgression(totalXP);

      return {
        ...progression,
        todayXP,
        totalTransactions,
      };
    }, 300);
  }

  /**
   * Fetches paginated XP transactions for the audit trail
   */
  static async getHistory(
    userId: string | Types.ObjectId,
    page = 1,
    limit = 20
  ) {
    await dbConnect();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const skip = (Math.max(1, page) - 1) * limit;

    const [transactions, total] = await Promise.all([
      XPTransaction.find({ userId: userObjId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      XPTransaction.countDocuments({ userId: userObjId }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

