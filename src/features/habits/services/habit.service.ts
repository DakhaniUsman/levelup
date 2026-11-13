import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Habit, { IHabit } from "@/models/Habit";
import HabitCompletion, { IHabitCompletion } from "@/models/HabitCompletion";
import { CreateHabitInput, UpdateHabitInput } from "../schemas/habit.schema";
import { XPService } from "@/features/progression/services/xp.service";
import { NotificationService } from "@/features/notifications/services/notification.service";

export interface HabitWithToday extends Omit<IHabit, "_id"> {
  _id: Types.ObjectId;
  isCompletedToday: boolean;
}

export class HabitService {
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

  static isScheduledDay(habit: IHabit, dayOfWeek: number): boolean {
    if (habit.frequency === "DAILY") return true;
    if (habit.frequency === "WEEKDAYS") return dayOfWeek >= 1 && dayOfWeek <= 5;
    if (habit.frequency === "WEEKENDS") return dayOfWeek === 0 || dayOfWeek === 6;
    if (habit.frequency === "CUSTOM") {
      return habit.customDays.includes(dayOfWeek);
    }
    return true;
  }

  static calculateStreak(
    habit: IHabit,
    completions: IHabitCompletion[],
    todayStr: string
  ): { currentStreak: number; longestStreak: number } {
    const completedDates = new Set(completions.map((c) => c.targetDate));
    let currentStreak = 0;

    // Check if today is completed
    const isDoneToday = completedDates.has(todayStr);

    // Start checking from today (if done) or yesterday (if not yet done today)
    const cursor = new Date(todayStr + "T00:00:00Z");
    if (!isDoneToday) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    // Traverse up to 365 days back
    for (let i = 0; i < 365; i++) {
      const dateStr = cursor.toISOString().split("T")[0];
      const dayOfWeek = cursor.getUTCDay();
      const isRequired = this.isScheduledDay(habit, dayOfWeek);

      if (isRequired) {
        if (completedDates.has(dateStr)) {
          currentStreak++;
        } else {
          // Missed an active required day: streak terminates
          break;
        }
      }
      // If it's a scheduled rest day, streak is preserved and we continue looking back
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    const longestStreak = Math.max(habit.longestStreak || 0, currentStreak);

    return { currentStreak, longestStreak };
  }

  static async createHabit(
    userId: string | Types.ObjectId,
    input: CreateHabitInput
  ): Promise<IHabit> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    let customDays = input.customDays || [0, 1, 2, 3, 4, 5, 6];
    if (input.frequency === "WEEKDAYS") customDays = [1, 2, 3, 4, 5];
    if (input.frequency === "WEEKENDS") customDays = [0, 6];

    const habit = await Habit.create({
      userId: userObjId,
      title: input.title.trim(),
      description: input.description?.trim() || "",
      category: input.category,
      frequency: input.frequency,
      customDays,
      targetPerDay: input.targetPerDay || 1,
      xpReward: input.xpReward || 20,
      currentStreak: 0,
      longestStreak: 0,
      isPaused: false,
      isArchived: false,
    });

    return habit;
  }

  static async getHabits(
    userId: string | Types.ObjectId,
    timezone = "UTC"
  ): Promise<HabitWithToday[]> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const todayStr = this.getTodayDateString(timezone);

    const habits = await Habit.find({
      userId: userObjId,
      isArchived: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    const habitIds = habits.map((h) => h._id);

    const todayCompletions = await HabitCompletion.find({
      habitId: { $in: habitIds },
      targetDate: todayStr,
    }).lean();

    const completedSet = new Set(
      todayCompletions.map((c) => c.habitId.toString())
    );

    return habits.map((h) => ({
      ...h,
      isCompletedToday: completedSet.has(h._id.toString()),
    })) as unknown as HabitWithToday[];
  }

  static async toggleHabit(
    habitId: string,
    userId: string | Types.ObjectId,
    timezone = "UTC"
  ): Promise<{
    habit: IHabit;
    isCompleted: boolean;
    xpEarned: number;
  }> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const habit = await Habit.findOne({
      _id: habitId,
      userId: userObjId,
      isArchived: false,
    });

    if (!habit) {
      throw new Error("Habit directive not found or access denied.");
    }

    const todayStr = this.getTodayDateString(timezone);

    const existingCompletion = await HabitCompletion.findOne({
      habitId: habit._id,
      targetDate: todayStr,
    });

    let isCompleted = false;
    let xpEarned = 0;

    if (existingCompletion) {
      // Toggle off / delete today's completion
      await HabitCompletion.deleteOne({ _id: existingCompletion._id });
      isCompleted = false;
    } else {
      // Complete habit for today
      const xpResult = await XPService.awardXP({
        userId: userObjId,
        amount: habit.xpReward,
        sourceType: "HABIT",
        sourceId: `${habit._id.toString()}:${todayStr}`,
        description: `Habit Preserved: ${habit.title} (+${habit.xpReward} XP)`,
      });

      await HabitCompletion.create({
        habitId: habit._id,
        userId: userObjId,
        targetDate: todayStr,
        completedCount: 1,
        completedAt: new Date(),
        xpTransactionId: xpResult.transaction._id,
      });

      isCompleted = true;
      if (xpResult.isNewReward) {
        xpEarned = habit.xpReward;
      }
    }

    // Recalculate streak
    const allCompletions = await HabitCompletion.find({ habitId: habit._id });
    const { currentStreak, longestStreak } = this.calculateStreak(
      habit,
      allCompletions,
      todayStr
    );

    const previousStreak = habit.currentStreak;
    habit.currentStreak = currentStreak;
    habit.longestStreak = longestStreak;
    await habit.save();

    // Check for milestone streak notifications (e.g. 7, 14, 30, 60, 100 days)
    if (
      isCompleted &&
      currentStreak > previousStreak &&
      [7, 14, 21, 30, 60, 100].includes(currentStreak)
    ) {
      await NotificationService.createNotification(userObjId, {
        title: `🔥 Streak Milestone: ${currentStreak} Days!`,
        message: `Hunter consistency unyielding! You maintained "${habit.title}" for ${currentStreak} consecutive days.`,
        type: "STREAK",
        link: "/habits",
      });
    }

    return { habit, isCompleted, xpEarned };
  }

  static async updateHabit(
    habitId: string,
    userId: string | Types.ObjectId,
    input: UpdateHabitInput
  ): Promise<IHabit> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const habit = await Habit.findOne({ _id: habitId, userId: userObjId });
    if (!habit) {
      throw new Error("Habit directive not found.");
    }

    if (input.title !== undefined) habit.title = input.title.trim();
    if (input.description !== undefined) habit.description = input.description.trim();
    if (input.category !== undefined) habit.category = input.category;
    if (input.frequency !== undefined) habit.frequency = input.frequency;
    if (input.customDays !== undefined) habit.customDays = input.customDays;
    if (input.targetPerDay !== undefined) habit.targetPerDay = input.targetPerDay;
    if (input.isPaused !== undefined) habit.isPaused = input.isPaused;
    if (input.isArchived !== undefined) habit.isArchived = input.isArchived;

    await habit.save();
    return habit;
  }

  static async deleteHabit(
    habitId: string,
    userId: string | Types.ObjectId
  ): Promise<boolean> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const res = await Habit.deleteOne({ _id: habitId, userId: userObjId });
    if (res.deletedCount > 0) {
      await HabitCompletion.deleteMany({ habitId });
      return true;
    }
    return false;
  }
}

