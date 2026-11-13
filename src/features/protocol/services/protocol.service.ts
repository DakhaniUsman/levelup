import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import DailyProtocol, { IDailyProtocol } from "@/models/DailyProtocol";
import Habit from "@/models/Habit";
import HabitCompletion from "@/models/HabitCompletion";
import Expense from "@/models/Expense";
import { XPService } from "@/features/progression/services/xp.service";
import { NotificationService } from "@/features/notifications/services/notification.service";

export class ProtocolService {
  static getTodayDateString(timezone = "UTC"): string {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(now);
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  }

  static getYesterdayDateString(timezone = "UTC"): string {
    try {
      const now = new Date();
      now.setUTCDate(now.getUTCDate() - 1);
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(now);
    } catch {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().split("T")[0];
    }
  }

  /**
   * Calculates total 0-100% daily completion across the 5 spheres
   */
  static calculateScore(protocol: IDailyProtocol): number {
    let totalItems = 0;
    let completedItems = 0;

    // 1. Spirituality (7 items: 5 prayers, quran, arabic)
    const prayers = protocol.spirituality.prayers;
    if (prayers.fajr) completedItems++;
    if (prayers.dhuhr) completedItems++;
    if (prayers.asr) completedItems++;
    if (prayers.maghrib) completedItems++;
    if (prayers.isha) completedItems++;
    if (protocol.spirituality.quran) completedItems++;
    if (protocol.spirituality.arabic) completedItems++;
    totalItems += 7;

    // 2. Mentally (3 items: planning, reading 10p, learning)
    if (protocol.mentally.dayPlanning) completedItems++;
    if (protocol.mentally.reading) completedItems++;
    if (protocol.mentally.selfLearning) completedItems++;
    totalItems += 3;

    // 3. Physically (5 items: morning w/o, breakfast, lunch, gym, sleep)
    if (protocol.physically.morningWorkout) completedItems++;
    if (protocol.physically.healthyBreakfast) completedItems++;
    if (protocol.physically.healthyLunch) completedItems++;
    if (protocol.physically.gymWorkout) completedItems++;
    if (protocol.physically.sleepTarget) completedItems++;
    totalItems += 5;

    // 4. Emotionally (3 items: scenarios, mushfa, family)
    if (protocol.emotionally.mentalPreparedness) completedItems++;
    if (protocol.emotionally.mushfaTime) completedItems++;
    if (protocol.emotionally.familyTime) completedItems++;
    totalItems += 3;

    // 5. Financially (1 item: audit logged)
    if (protocol.financially.auditCompleted) completedItems++;
    totalItems += 1;

    return Math.round((completedItems / totalItems) * 100);
  }

  static async getOrCreateTodayProtocol(
    userId: string | Types.ObjectId,
    timezone = "UTC"
  ): Promise<IDailyProtocol> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const todayStr = this.getTodayDateString(timezone);

    let protocol = await DailyProtocol.findOne({
      userId: userObjId,
      targetDate: todayStr,
    });

    if (!protocol) {
      // Check if yesterday's protocol was missed (under 70% floor) and penalty wasn't cleared
      const yesterdayStr = this.getYesterdayDateString(timezone);
      const yesterdayProtocol = await DailyProtocol.findOne({
        userId: userObjId,
        targetDate: yesterdayStr,
      });

      let enterPenalty = false;
      if (yesterdayProtocol && yesterdayProtocol.overallScore < 70 && !yesterdayProtocol.penalty.isCleared) {
        enterPenalty = true;
      }

      protocol = await DailyProtocol.create({
        userId: userObjId,
        targetDate: todayStr,
        inPenaltyZone: enterPenalty,
        penalty: {
          pushupsDone: 0,
          pushupsTarget: 20,
          squatsDone: 0,
          squatsTarget: 20,
          stepsDone: 0,
          stepsTarget: 10000,
          isCleared: false,
        },
      });

      if (enterPenalty) {
        await NotificationService.createNotification(userObjId, {
          title: "🚨 PENALTY ZONE ACTIVATED",
          message: "Yesterday's mandatory threshold was missed (<70%). Complete 20 Pushups, 20 Squats & 10,000 Steps to clear the penalty.",
          type: "SYSTEM",
          link: "/dashboard",
        });
      }
    }

    // Refresh today's financial spending total from Expense model
    const expensesToday = await Expense.aggregate([
      { $match: { userId: userObjId, targetDate: todayStr } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const totalSpent = expensesToday[0]?.total || 0;
    const hasExpenses = (expensesToday[0]?.count || 0) > 0;

    if (protocol.financially.totalSpentToday !== totalSpent || (hasExpenses && !protocol.financially.auditCompleted)) {
      protocol.financially.totalSpentToday = totalSpent;
      if (hasExpenses) protocol.financially.auditCompleted = true;
      protocol.overallScore = this.calculateScore(protocol);
      await protocol.save();
    }

    return protocol;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async updateProtocol(
    userId: string | Types.ObjectId,
    timezone = "UTC",
    updateData: any
  ): Promise<IDailyProtocol> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const protocol = await this.getOrCreateTodayProtocol(userObjId, timezone);

    // Deep merge fields
    if (updateData.spirituality) {
      if (updateData.spirituality.prayers) {
        Object.assign(protocol.spirituality.prayers, updateData.spirituality.prayers);
      }
      if (updateData.spirituality.quran !== undefined) {
        protocol.spirituality.quran = updateData.spirituality.quran;
      }
      if (updateData.spirituality.arabic !== undefined) {
        protocol.spirituality.arabic = updateData.spirituality.arabic;
      }
    }

    if (updateData.mentally) {
      Object.assign(protocol.mentally, updateData.mentally);
    }

    if (updateData.physically) {
      Object.assign(protocol.physically, updateData.physically);
    }

    if (updateData.emotionally) {
      Object.assign(protocol.emotionally, updateData.emotionally);
    }

    if (updateData.financially) {
      Object.assign(protocol.financially, updateData.financially);
    }

    protocol.overallScore = this.calculateScore(protocol);

    // If score hits 100%, award Monarch bonus XP
    if (protocol.overallScore === 100) {
      await XPService.awardXP({
        userId: userObjId,
        amount: 150,
        sourceType: "MANUAL_ADJUSTMENT",
        sourceId: `PROTOCOL_100:${protocol.targetDate}`,
        description: `S-Rank 100% Clear: All 5 Living Spheres Perfected (+150 XP)`,
      });
    }

    await protocol.save();
    return protocol;
  }

  /**
   * Log progress for the Physical Penalty Quest (20 pushups, 20 squats, 10,000 steps)
   */
  static async logPenaltyProgress(
    userId: string | Types.ObjectId,
    timezone = "UTC",
    progress: { pushups?: number; squats?: number; steps?: number }
  ): Promise<IDailyProtocol> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const protocol = await this.getOrCreateTodayProtocol(userObjId, timezone);

    if (progress.pushups !== undefined) {
      protocol.penalty.pushupsDone = Math.max(0, protocol.penalty.pushupsDone + progress.pushups);
    }
    if (progress.squats !== undefined) {
      protocol.penalty.squatsDone = Math.max(0, protocol.penalty.squatsDone + progress.squats);
    }
    if (progress.steps !== undefined) {
      protocol.penalty.stepsDone = Math.max(0, protocol.penalty.stepsDone + progress.steps);
    }

    const cleared =
      protocol.penalty.pushupsDone >= protocol.penalty.pushupsTarget &&
      protocol.penalty.squatsDone >= protocol.penalty.squatsTarget &&
      protocol.penalty.stepsDone >= protocol.penalty.stepsTarget;

    if (cleared && !protocol.penalty.isCleared) {
      protocol.penalty.isCleared = true;
      protocol.inPenaltyZone = false;

      await NotificationService.createNotification(userObjId, {
        title: "⚡ PENALTY QUEST CONQUERED",
        message: "You survived 20 Pushups, 20 Squats, and 10,000 Steps! The System has been normalized.",
        type: "SYSTEM",
        link: "/dashboard",
      });
    }

    await protocol.save();
    return protocol;
  }

  /**
   * STRICT JUDGEMENT: Purges 100% of today's earned XP and breaks the habit streak.
   */
  static async executeSystemJudgement(
    userId: string | Types.ObjectId,
    timezone = "UTC",
    reason: string
  ): Promise<{ purgedXP: number; protocol: IDailyProtocol }> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const stats = await XPService.getProgressionStats(userObjId);
    const purgedXP = stats.todayXP || 0;

    // 1. Issue negative XP transaction if any XP was earned today
    if (purgedXP > 0) {
      await XPService.awardXP({
        userId: userObjId,
        amount: -purgedXP,
        sourceType: "MANUAL_ADJUSTMENT",
        sourceId: `JUDGEMENT:${Date.now()}`,
        description: `System Judgement Execution: ${reason || "Transgression Committed"} (-${purgedXP} XP Purged)`,
        transactionType: "PENALTY",
      });
    }

    // 2. Mark protocol as transgressed
    const protocol = await this.getOrCreateTodayProtocol(userObjId, timezone);
    protocol.isTransgressed = true;
    protocol.transgressionReason = reason || "Transgression declared by Hunter";
    protocol.transgressedAt = new Date();
    await protocol.save();

    // 3. Reset streaks on all user habits (breaking current streak)
    await Habit.updateMany(
      { userId: userObjId },
      { $set: { currentStreak: 0 } }
    );

    // Delete today's habit completions so they cannot contribute to streaks
    const todayStr = this.getTodayDateString(timezone);
    await HabitCompletion.deleteMany({
      userId: userObjId,
      targetDate: todayStr,
    });

    // 4. Dispatch high-priority crimson alert
    await NotificationService.createNotification(userObjId, {
      title: "⚔️ SYSTEM JUDGEMENT EXECUTED",
      message: `All ${purgedXP} XP earned today has been purged and your streaks have been broken. Seek repentance, reset discipline, and rebuild your honor.`,
      type: "SYSTEM",
      link: "/dashboard",
    });

    return { purgedXP, protocol };
  }
}

