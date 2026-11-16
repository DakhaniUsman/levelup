import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import DailyProtocol, { IDailyProtocol, IDailyActivityRecord } from "@/models/DailyProtocol";
import ProtocolItem from "@/models/ProtocolItem";
import Habit from "@/models/Habit";
import HabitCompletion from "@/models/HabitCompletion";
import Expense from "@/models/Expense";
import Workout from "@/models/Workout";
import { XPService } from "@/features/progression/services/xp.service";
import { NotificationService } from "@/features/notifications/services/notification.service";
import { ProtocolItemService } from "./protocol-item.service";

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
   * Calculates total 0-100% daily completion across active activities
   */
  static calculateScore(protocol: IDailyProtocol): number {
    // Dynamic formula when activities array exists and has items
    if (protocol.activities && protocol.activities.length > 0) {
      let totalPoints = 0;
      let completedPoints = 0;

      for (const act of protocol.activities) {
        if (act.type === "PRAYER_TRACKER") {
          totalPoints += 5;
          const sub = act.subItems || {};
          if (sub.fajr) completedPoints++;
          if (sub.dhuhr) completedPoints++;
          if (sub.asr) completedPoints++;
          if (sub.maghrib) completedPoints++;
          if (sub.isha) completedPoints++;
        } else {
          totalPoints += 1;
          if (act.isCompleted) completedPoints++;
        }
      }

      if (totalPoints === 0) return 0;
      return Math.round((completedPoints / totalPoints) * 100);
    }

    // Fallback formula for historical legacy records without activities
    let totalItems = 0;
    let completedItems = 0;

    // 1. Spirituality (7 items: 5 prayers, quran, arabic)
    const prayers = protocol.spirituality?.prayers;
    if (prayers) {
      if (prayers.fajr) completedItems++;
      if (prayers.dhuhr) completedItems++;
      if (prayers.asr) completedItems++;
      if (prayers.maghrib) completedItems++;
      if (prayers.isha) completedItems++;
    }
    if (protocol.spirituality?.quran) completedItems++;
    if (protocol.spirituality?.arabic) completedItems++;
    totalItems += 7;

    // 2. Mentally (3 items: planning, reading 10p, learning)
    if (protocol.mentally?.dayPlanning) completedItems++;
    if (protocol.mentally?.reading) completedItems++;
    if (protocol.mentally?.selfLearning) completedItems++;
    totalItems += 3;

    // 3. Physically (5 items: morning w/o, breakfast, lunch, gym, sleep)
    if (protocol.physically?.morningWorkout) completedItems++;
    if (protocol.physically?.healthyBreakfast) completedItems++;
    if (protocol.physically?.healthyLunch) completedItems++;
    if (protocol.physically?.gymWorkout) completedItems++;
    if (protocol.physically?.sleepTarget) completedItems++;
    totalItems += 5;

    // 4. Emotionally (3 items: scenarios, mushfa, family)
    if (protocol.emotionally?.mentalPreparedness) completedItems++;
    if (protocol.emotionally?.mushfaTime) completedItems++;
    if (protocol.emotionally?.familyTime) completedItems++;
    totalItems += 3;

    // 5. Financially (1 item: audit logged)
    if (protocol.financially?.auditCompleted) completedItems++;
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

    // Ensure user has default items configured
    await ProtocolItemService.seedDefaultItemsIfNone(userObjId);

    // Fetch active non-deleted items for this user
    const activeItems = await ProtocolItem.find({
      userId: userObjId,
      isActive: true,
      isDeleted: false,
    }).sort({ sphere: 1, order: 1 });

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
      if (
        yesterdayProtocol &&
        yesterdayProtocol.overallScore < 70 &&
        !yesterdayProtocol.penalty.isCleared
      ) {
        enterPenalty = true;
      }

      // Build initial activity snapshots from active configuration
      const activitySnapshots: IDailyActivityRecord[] = activeItems.map((item) => ({
        itemId: item._id as Types.ObjectId,
        sphere: item.sphere,
        type: item.type,
        title: item.title,
        description: item.description,
        order: item.order,
        isCompleted: false,
        subItems:
          item.type === "PRAYER_TRACKER"
            ? { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }
            : undefined,
        metadata:
          item.type === "FINANCIAL_AUDIT"
            ? { totalSpentToday: 0 }
            : undefined,
      }));

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
        activities: activitySnapshots,
      });

      if (enterPenalty) {
        await NotificationService.createNotification(userObjId, {
          title: "🚨 PENALTY ZONE ACTIVATED",
          message:
            "Yesterday's mandatory threshold was missed (<70%). Complete 20 Pushups, 20 Squats & 10,000 Steps to clear the penalty.",
          type: "SYSTEM",
          link: "/dashboard",
        });
      }
    } else {
      const currentProtocol = protocol;
      // If protocol exists but activities array is empty (created before migration), populate snapshots
      if (!currentProtocol.activities || currentProtocol.activities.length === 0) {
        currentProtocol.activities = activeItems.map((item) => {
          let isDone = false;
          let subItems;

          if (item.type === "PRAYER_TRACKER") {
            const pr = currentProtocol.spirituality?.prayers || {
              fajr: false,
              dhuhr: false,
              asr: false,
              maghrib: false,
              isha: false,
            };
            subItems = { ...pr };
            isDone = pr.fajr && pr.dhuhr && pr.asr && pr.maghrib && pr.isha;
          } else if (item.title === "Quran Recitation") {
            isDone = !!currentProtocol.spirituality?.quran;
          } else if (item.title === "Learning Arabic") {
            isDone = !!currentProtocol.spirituality?.arabic;
          } else if (item.title.includes("Planning")) {
            isDone = !!currentProtocol.mentally?.dayPlanning;
          } else if (item.title.includes("10 Pages") || item.title.includes("Read")) {
            isDone = !!currentProtocol.mentally?.reading;
          } else if (item.title.includes("Self-Learning") || item.title.includes("Research")) {
            isDone = !!currentProtocol.mentally?.selfLearning;
          } else if (item.title.includes("Morning Light Workout") || item.title.includes("Walk")) {
            isDone = !!currentProtocol.physically?.morningWorkout;
          } else if (item.title.includes("Breakfast")) {
            isDone = !!currentProtocol.physically?.healthyBreakfast;
          } else if (item.title.includes("Lunch")) {
            isDone = !!currentProtocol.physically?.healthyLunch;
          } else if (item.type === "WORKOUT_LOG" || item.title.includes("Gym")) {
            isDone = !!currentProtocol.physically?.gymWorkout;
          } else if (item.title.includes("Sleep")) {
            isDone = !!currentProtocol.physically?.sleepTarget;
          } else if (item.title.includes("Preparedness")) {
            isDone = !!currentProtocol.emotionally?.mentalPreparedness;
          } else if (item.title.includes("Mushfa")) {
            isDone = !!currentProtocol.emotionally?.mushfaTime;
          } else if (item.title.includes("Family")) {
            isDone = !!currentProtocol.emotionally?.familyTime;
          } else if (item.type === "FINANCIAL_AUDIT") {
            isDone = !!currentProtocol.financially?.auditCompleted;
          }

          return {
            itemId: item._id as Types.ObjectId,
            sphere: item.sphere,
            type: item.type,
            title: item.title,
            description: item.description,
            order: item.order,
            isCompleted: isDone,
            subItems,
            metadata:
              item.type === "FINANCIAL_AUDIT"
                ? { totalSpentToday: currentProtocol.financially?.totalSpentToday || 0 }
                : undefined,
          };
        });

        currentProtocol.overallScore = this.calculateScore(currentProtocol);
        await currentProtocol.save();
      } else {
        // Check if user has active items not yet in today's activities (e.g. newly added today)
        let modified = false;
        for (const item of activeItems) {
          const exists = currentProtocol.activities.some(
            (a) => a.itemId.toString() === item._id.toString()
          );
          if (!exists) {
            currentProtocol.activities.push({
              itemId: item._id as Types.ObjectId,
              sphere: item.sphere,
              type: item.type,
              title: item.title,
              description: item.description,
              order: item.order,
              isCompleted: false,
              subItems:
                item.type === "PRAYER_TRACKER"
                  ? { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }
                  : undefined,
              metadata:
                item.type === "FINANCIAL_AUDIT"
                  ? { totalSpentToday: 0 }
                  : undefined,
            });
            modified = true;
          }
        }
        if (modified) {
          currentProtocol.overallScore = this.calculateScore(currentProtocol);
          await currentProtocol.save();
        }
      }
    }

    // Refresh today's financial spending total from Expense model
    const expensesToday = await Expense.aggregate([
      { $match: { userId: userObjId, targetDate: todayStr } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const totalSpent = expensesToday[0]?.total || 0;
    const hasExpenses = (expensesToday[0]?.count || 0) > 0;

    let hasSpendingChanges = false;
    if (
      protocol.financially.totalSpentToday !== totalSpent ||
      protocol.financially.auditCompleted !== hasExpenses
    ) {
      protocol.financially.totalSpentToday = totalSpent;
      protocol.financially.auditCompleted = hasExpenses;
      hasSpendingChanges = true;
    }

    // Sync financial audit activity in activities array
    for (const act of protocol.activities) {
      if (act.type === "FINANCIAL_AUDIT") {
        if (!act.metadata) act.metadata = {};
        if (act.metadata.totalSpentToday !== totalSpent) {
          act.metadata.totalSpentToday = totalSpent;
          hasSpendingChanges = true;
        }
        if (act.isCompleted !== hasExpenses) {
          act.isCompleted = hasExpenses;
          act.completedAt = hasExpenses ? new Date() : undefined;
          hasSpendingChanges = true;
        }
      }
    }

    // Refresh today's workout completion from Workout model
    const workoutsTodayCount = await Workout.countDocuments({
      userId: userObjId,
      targetDate: todayStr,
    });
    const hasWorkoutsToday = workoutsTodayCount > 0;

    let hasWorkoutChanges = false;
    if (protocol.physically.gymWorkout !== hasWorkoutsToday) {
      protocol.physically.gymWorkout = hasWorkoutsToday;
      hasWorkoutChanges = true;
    }

    for (const act of protocol.activities) {
      if (act.type === "WORKOUT_LOG" || act.title.includes("Gym")) {
        if (act.isCompleted !== hasWorkoutsToday) {
          act.isCompleted = hasWorkoutsToday;
          act.completedAt = hasWorkoutsToday ? new Date() : undefined;
          hasWorkoutChanges = true;
        }
      }
    }

    if (hasSpendingChanges || hasWorkoutChanges) {
      protocol.overallScore = this.calculateScore(protocol);
      await protocol.save();
    }

    return protocol;
  }

  /**
   * Cross-module sync helper for workouts
   */
  static async syncWorkoutStatus(
    userId: string | Types.ObjectId,
    timezone = "UTC"
  ): Promise<IDailyProtocol> {
    return this.getOrCreateTodayProtocol(userId, timezone);
  }

  /**
   * Cross-module sync helper for expense audit
   */
  static async syncExpenseAudit(
    userId: string | Types.ObjectId,
    timezone = "UTC"
  ): Promise<IDailyProtocol> {
    return this.getOrCreateTodayProtocol(userId, timezone);
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

    // 1. Dynamic activity toggle by itemId
    if (updateData.itemId) {
      const act = protocol.activities.find(
        (a) => a.itemId.toString() === updateData.itemId.toString()
      );

      if (act) {
        if (updateData.subKey) {
          if (!act.subItems) {
            act.subItems = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (act.subItems as any)[updateData.subKey] = !!updateData.subValue;

          // Sync to legacy prayers
          if (protocol.spirituality?.prayers) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (protocol.spirituality.prayers as any)[updateData.subKey] = !!updateData.subValue;
          }

          const all5Done =
            act.subItems.fajr &&
            act.subItems.dhuhr &&
            act.subItems.asr &&
            act.subItems.maghrib &&
            act.subItems.isha;

          act.isCompleted = !!all5Done;
          act.completedAt = act.isCompleted ? new Date() : undefined;
        } else if (updateData.isCompleted !== undefined) {
          act.isCompleted = !!updateData.isCompleted;
          act.completedAt = act.isCompleted ? new Date() : undefined;

          // Sync to legacy fields based on type
          if (act.type === "WORKOUT_LOG") {
            protocol.physically.gymWorkout = act.isCompleted;
          } else if (act.type === "FINANCIAL_AUDIT") {
            protocol.financially.auditCompleted = act.isCompleted;
          }
        }
      }
    }

    // 2. Legacy deep-merge support (backward compatibility)
    if (updateData.spirituality) {
      if (updateData.spirituality.prayers) {
        Object.assign(protocol.spirituality.prayers, updateData.spirituality.prayers);
        // Sync to prayer activity
        const prayerAct = protocol.activities.find((a) => a.type === "PRAYER_TRACKER");
        if (prayerAct) {
          if (!prayerAct.subItems) {
            prayerAct.subItems = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
          }
          Object.assign(prayerAct.subItems, updateData.spirituality.prayers);
          prayerAct.isCompleted = Boolean(
            prayerAct.subItems.fajr &&
            prayerAct.subItems.dhuhr &&
            prayerAct.subItems.asr &&
            prayerAct.subItems.maghrib &&
            prayerAct.subItems.isha
          );
        }
      }
      if (updateData.spirituality.quran !== undefined) {
        protocol.spirituality.quran = updateData.spirituality.quran;
        const quranAct = protocol.activities.find((a) => a.title.includes("Quran"));
        if (quranAct) quranAct.isCompleted = updateData.spirituality.quran;
      }
      if (updateData.spirituality.arabic !== undefined) {
        protocol.spirituality.arabic = updateData.spirituality.arabic;
        const arabicAct = protocol.activities.find((a) => a.title.includes("Arabic"));
        if (arabicAct) arabicAct.isCompleted = updateData.spirituality.arabic;
      }
    }

    if (updateData.mentally) {
      Object.assign(protocol.mentally, updateData.mentally);
      if (updateData.mentally.dayPlanning !== undefined) {
        const pAct = protocol.activities.find((a) => a.title.includes("Planning"));
        if (pAct) pAct.isCompleted = updateData.mentally.dayPlanning;
      }
      if (updateData.mentally.reading !== undefined) {
        const rAct = protocol.activities.find((a) => a.title.includes("Read"));
        if (rAct) rAct.isCompleted = updateData.mentally.reading;
      }
      if (updateData.mentally.selfLearning !== undefined) {
        const lAct = protocol.activities.find((a) => a.title.includes("Learning") || a.title.includes("Research"));
        if (lAct) lAct.isCompleted = updateData.mentally.selfLearning;
      }
    }

    if (updateData.physically) {
      Object.assign(protocol.physically, updateData.physically);
      if (updateData.physically.morningWorkout !== undefined) {
        const mAct = protocol.activities.find((a) => a.title.includes("Morning Light") || a.title.includes("Walk"));
        if (mAct) mAct.isCompleted = updateData.physically.morningWorkout;
      }
      if (updateData.physically.healthyBreakfast !== undefined) {
        const bAct = protocol.activities.find((a) => a.title.includes("Breakfast"));
        if (bAct) bAct.isCompleted = updateData.physically.healthyBreakfast;
      }
      if (updateData.physically.healthyLunch !== undefined) {
        const lAct = protocol.activities.find((a) => a.title.includes("Lunch"));
        if (lAct) lAct.isCompleted = updateData.physically.healthyLunch;
      }
      if (updateData.physically.gymWorkout !== undefined) {
        const gAct = protocol.activities.find((a) => a.type === "WORKOUT_LOG" || a.title.includes("Gym"));
        if (gAct) gAct.isCompleted = updateData.physically.gymWorkout;
      }
      if (updateData.physically.sleepTarget !== undefined) {
        const sAct = protocol.activities.find((a) => a.title.includes("Sleep"));
        if (sAct) sAct.isCompleted = updateData.physically.sleepTarget;
      }
    }

    if (updateData.emotionally) {
      Object.assign(protocol.emotionally, updateData.emotionally);
      if (updateData.emotionally.mentalPreparedness !== undefined) {
        const mpAct = protocol.activities.find((a) => a.title.includes("Preparedness"));
        if (mpAct) mpAct.isCompleted = updateData.emotionally.mentalPreparedness;
      }
      if (updateData.emotionally.mushfaTime !== undefined) {
        const mfAct = protocol.activities.find((a) => a.title.includes("Mushfa"));
        if (mfAct) mfAct.isCompleted = updateData.emotionally.mushfaTime;
      }
      if (updateData.emotionally.familyTime !== undefined) {
        const fAct = protocol.activities.find((a) => a.title.includes("Family"));
        if (fAct) fAct.isCompleted = updateData.emotionally.familyTime;
      }
    }

    if (updateData.financially) {
      Object.assign(protocol.financially, updateData.financially);
      if (updateData.financially.auditCompleted !== undefined) {
        const faAct = protocol.activities.find((a) => a.type === "FINANCIAL_AUDIT");
        if (faAct) faAct.isCompleted = updateData.financially.auditCompleted;
      }
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
