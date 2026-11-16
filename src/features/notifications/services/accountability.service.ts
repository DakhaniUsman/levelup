import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import NotificationPreference, {
  INotificationPreference,
} from "@/models/NotificationPreference";
import NotificationDispatchLog from "@/models/NotificationDispatchLog";
import UserProfile from "@/models/UserProfile";
import Habit from "@/models/Habit";
import Workout from "@/models/Workout";
import Expense from "@/models/Expense";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import { QuestService } from "@/features/quests/services/quest.service";
import { NotificationService } from "./notification.service";
import { PushService } from "./push.service";
import { NotificationType } from "@/models/Notification";

export interface SendAlertParams {
  userId: string | Types.ObjectId;
  dedupeKey: string;
  category: "protocol" | "habits" | "quests" | "progression" | "workouts" | "expenses" | "dailyReport";
  title: string;
  message: string;
  url?: string;
  type?: NotificationType;
  bypassQuietHours?: boolean;
}

export class AccountabilityService {
  /**
   * Retrieves or initializes notification preferences for a user
   */
  static async getUserPreferences(
    userId: string | Types.ObjectId
  ): Promise<INotificationPreference> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    let prefs = await NotificationPreference.findOne({ userId: userObjId });
    if (!prefs) {
      prefs = await NotificationPreference.create({
        userId: userObjId,
        enabled: true,
        categories: {
          protocol: true,
          habits: true,
          quests: true,
          progression: true,
          workouts: true,
          expenses: true,
          dailyReport: true,
        },
        reminderTimes: {
          morning: "08:00",
          afternoon: "14:00",
          evening: "18:30",
          night: "21:30",
          dailyReport: "22:30",
        },
        quietHours: {
          enabled: true,
          start: "23:00",
          end: "07:00",
        },
        maxRemindersPerDay: 6,
      });
    }

    return prefs;
  }

  /**
   * Updates user notification preferences
   */
  static async updateUserPreferences(
    userId: string | Types.ObjectId,
    updateData: Partial<INotificationPreference>
  ): Promise<INotificationPreference> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId: userObjId },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return prefs;
  }

  /**
   * Evaluates if the given user time is currently inside quiet hours
   */
  static isWithinQuietHours(timezone: string, quietHours: { enabled: boolean; start: string; end: string }): boolean {
    if (!quietHours.enabled) return false;

    try {
      const now = new Date();
      const timeString = new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);

      const [currentHour, currentMin] = timeString.split(":").map(Number);
      const currentMinutes = currentHour * 60 + currentMin;

      const [startHour, startMin] = quietHours.start.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;

      const [endHour, endMin] = quietHours.end.split(":").map(Number);
      const endMinutes = endHour * 60 + endMin;

      // Handle overnight quiet hours (e.g. 23:00 to 07:00)
      if (startMinutes > endMinutes) {
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      } else {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      }
    } catch {
      return false;
    }
  }

  /**
   * Dispatches an accountability alert if permitted by preferences, quiet hours, and idempotency
   */
  static async dispatchAlert(params: SendAlertParams): Promise<{ dispatched: boolean; reason?: string }> {
    await dbConnect();
    const userObjId = typeof params.userId === "string" ? new Types.ObjectId(params.userId) : params.userId;

    const prefs = await this.getUserPreferences(userObjId);
    if (!prefs.enabled) {
      return { dispatched: false, reason: "notifications_disabled_by_user" };
    }

    // Category toggle check
    if (!prefs.categories[params.category]) {
      return { dispatched: false, reason: `category_${params.category}_disabled` };
    }

    // Idempotency check
    const existingLog = await NotificationDispatchLog.findOne({
      userId: userObjId,
      dedupeKey: params.dedupeKey,
    });
    if (existingLog) {
      return { dispatched: false, reason: "already_dispatched" };
    }

    // Quiet hours check
    if (!params.bypassQuietHours) {
      const profile = await UserProfile.findOne({ userId: userObjId });
      const timezone = profile?.timezone || "UTC";
      if (this.isWithinQuietHours(timezone, prefs.quietHours)) {
        return { dispatched: false, reason: "in_quiet_hours" };
      }
    }

    // 1. Create In-App Notification
    await NotificationService.createNotification(userObjId, {
      title: params.title,
      message: params.message,
      type: params.type || "SYSTEM",
      link: params.url || "/dashboard",
    });

    // 2. Dispatch Web Push to all active registered devices
    await PushService.sendPushToUser(userObjId, {
      title: params.title,
      body: params.message,
      url: params.url || "/dashboard",
      tag: params.dedupeKey,
    });

    // 3. Log dispatch to prevent duplicates
    await NotificationDispatchLog.create({
      userId: userObjId,
      dedupeKey: params.dedupeKey,
      category: params.category,
      title: params.title,
      channel: "BOTH",
      dispatchedAt: new Date(),
    });

    return { dispatched: true };
  }

  /**
   * Evaluates a single user's accountability state and triggers necessary scheduled reminders
   */
  static async evaluateUserAccountability(
    userId: string | Types.ObjectId
  ): Promise<{ evaluated: boolean; alertsSent: string[] }> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const profile = await UserProfile.findOne({ userId: userObjId });
    const timezone = profile?.timezone || "UTC";
    const todayStr = ProtocolService.getTodayDateString(timezone);

    // Current local hour
    const now = new Date();
    const localHourStr = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      hour12: false,
    }).format(now);
    const localHour = parseInt(localHourStr, 10);

    const alertsSent: string[] = [];

    // 1. Daily Protocol Check
    const protocol = await ProtocolService.getOrCreateTodayProtocol(userObjId, timezone);
    const completionPercent = protocol.overallScore || 0;
    const isComplete = completionPercent === 100;

    // 1A. Emergency Penalty Alert
    if (protocol.inPenaltyZone) {
      const p = protocol.penalty;
      const res = await this.dispatchAlert({
        userId: userObjId,
        dedupeKey: `penalty_alert_${todayStr}`,
        category: "protocol",
        title: "SYSTEM ALERT: EMERGENCY PENALTY",
        message: `Penalty Zone active! Progress: ${p.pushupsDone}/20 pushups, ${p.squatsDone}/20 squats, ${p.stepsDone.toLocaleString()}/10,000 steps. Clear before midnight.`,
        url: "/dashboard",
        type: "SYSTEM",
        bypassQuietHours: true,
      });
      if (res.dispatched) alertsSent.push("emergency_penalty");
    }

    // 1B. Daily Protocol Reminders (Only if incomplete)
    if (!isComplete && !protocol.inPenaltyZone) {
      if (localHour >= 14 && localHour < 18) {
        const res = await this.dispatchAlert({
          userId: userObjId,
          dedupeKey: `protocol_afternoon_${todayStr}`,
          category: "protocol",
          title: "SYSTEM ALERT: DAILY PROTOCOL",
          message: `Hunter, your Daily Protocol is currently ${completionPercent}% complete. Return to the system and maintain discipline.`,
          url: "/dashboard",
          type: "SYSTEM",
        });
        if (res.dispatched) alertsSent.push("protocol_afternoon");
      } else if (localHour >= 18 && localHour < 21) {
        const remaining = (protocol.activities || []).filter((a) => !a.isCompleted).length;
        const res = await this.dispatchAlert({
          userId: userObjId,
          dedupeKey: `protocol_evening_${todayStr}`,
          category: "protocol",
          title: "HUNTER WARNING: INCOMPLETE PROTOCOL",
          message: `Evening approaches. ${remaining} activities remain unfinished in your 5 Living Spheres. Complete them before nightfall.`,
          url: "/dashboard",
          type: "SYSTEM",
        });
        if (res.dispatched) alertsSent.push("protocol_evening");
      } else if (localHour >= 21) {
        const res = await this.dispatchAlert({
          userId: userObjId,
          dedupeKey: `protocol_night_${todayStr}`,
          category: "protocol",
          title: "SYSTEM ALERT: PROTOCOL DEADLINE",
          message: `Final hours of the day. Complete your mandatory spheres to prevent penalty zone activation.`,
          url: "/dashboard",
          type: "SYSTEM",
        });
        if (res.dispatched) alertsSent.push("protocol_night");
      }
    }

    // 2. Habits Streak Risk Check (Hour >= 18)
    if (localHour >= 18) {
      const incompleteHabits = await Habit.find({
        userId: userObjId,
        isActive: true,
        lastCompletedDate: { $ne: todayStr },
      });

      if (incompleteHabits.length > 0) {
        const res = await this.dispatchAlert({
          userId: userObjId,
          dedupeKey: `habits_streak_${todayStr}`,
          category: "habits",
          title: "STREAK WARNING",
          message: `${incompleteHabits.length} habit streaks are at risk today. Check in and preserve your momentum.`,
          url: "/habits",
          type: "STREAK",
        });
        if (res.dispatched) alertsSent.push("habits_streak");
      }
    }

    // 3. Quests Incomplete Check (Hour >= 16)
    if (localHour >= 16) {
      const occurrences = await QuestService.getTodayOccurrences(userObjId, timezone);
      const pendingQuests = occurrences.filter((q) => q.status === "PENDING");

      if (pendingQuests.length > 0) {
        const res = await this.dispatchAlert({
          userId: userObjId,
          dedupeKey: `quests_pending_${todayStr}`,
          category: "quests",
          title: "QUEST TRIALS PENDING",
          message: `Hunter, you have ${pendingQuests.length} daily quest trials awaiting clearance. Claim your XP rewards.`,
          url: "/quests",
          type: "SYSTEM",
        });
        if (res.dispatched) alertsSent.push("quests_pending");
      }
    }

    // 4. Evening Workout Check (Hour >= 19 to 21)
    if (localHour >= 19 && localHour <= 21) {
      const todayWorkout = await Workout.findOne({
        userId: userObjId,
        date: todayStr,
      });

      if (!todayWorkout) {
        const res = await this.dispatchAlert({
          userId: userObjId,
          dedupeKey: `workout_reminder_${todayStr}`,
          category: "workouts",
          title: "PHYSICAL DIRECTIVE",
          message: `Evening workout session not yet recorded. Log your training and progressive overload.`,
          url: "/dashboard",
          type: "SYSTEM",
        });
        if (res.dispatched) alertsSent.push("workout_reminder");
      }
    }

    // 5. Financial Audit Check (Hour >= 21)
    if (localHour >= 21) {
      const todayExpenses = await Expense.findOne({
        userId: userObjId,
        date: todayStr,
      });

      if (!todayExpenses) {
        const res = await this.dispatchAlert({
          userId: userObjId,
          dedupeKey: `expense_audit_${todayStr}`,
          category: "expenses",
          title: "FINANCIAL DISCIPLINE AUDIT",
          message: `Daily financial accounting pending. Complete your daily expense audit before sleep.`,
          url: "/dashboard",
          type: "SYSTEM",
        });
        if (res.dispatched) alertsSent.push("expense_audit");
      }
    }

    // 6. Daily Report (Hour >= 22)
    if (localHour >= 22) {
      const res = await this.dispatchAlert({
        userId: userObjId,
        dedupeKey: `daily_report_${todayStr}`,
        category: "dailyReport",
        title: "DAILY HUNTER RECAP",
        message: `Day concluding. Protocol: ${completionPercent}%. Rest well, Hunter. Tomorrow the path continues.`,
        url: "/dashboard",
        type: "SYSTEM",
      });
      if (res.dispatched) alertsSent.push("daily_report");
    }

    return { evaluated: true, alertsSent };
  }

  /**
   * Runs the accountability cycle across all active users
   */
  static async runGlobalAccountabilityCycle(): Promise<{ totalUsers: number; results: any[] }> {
    await dbConnect();

    // Find all users who have active preferences or subscriptions
    const activePrefs = await NotificationPreference.find({ enabled: true }).select("userId");
    const userIds = [...new Set(activePrefs.map((p) => p.userId.toString()))];

    const results = [];
    for (const uId of userIds) {
      try {
        const outcome = await this.evaluateUserAccountability(uId);
        results.push({ userId: uId, ...outcome });
      } catch (err: any) {
        console.error(`Accountability evaluation error for user ${uId}:`, err.message);
        results.push({ userId: uId, error: err.message });
      }
    }

    return { totalUsers: userIds.length, results };
  }
}
