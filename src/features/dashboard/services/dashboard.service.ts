import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import { XPService } from "@/features/progression/services/xp.service";
import { QuestService } from "@/features/quests/services/quest.service";
import Task from "@/models/Task";
import UserProfile from "@/models/UserProfile";

export class DashboardService {
  static async getDashboardData(userId: string | Types.ObjectId) {
    await dbConnect();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const profile = await UserProfile.findOne({ userId: userObjId });
    const timezone = profile?.timezone || "UTC";

    // Run parallel queries
    const [progressionStats, todayQuests, recentTasks, categoryCounts] =
      await Promise.all([
        XPService.getProgressionStats(userObjId),
        QuestService.getTodayOccurrences(userObjId, timezone),
        Task.find({ userId: userObjId, isArchived: false, status: { $ne: "COMPLETED" } })
          .sort({ dueDate: 1, priority: -1 })
          .limit(5)
          .lean(),
        Task.aggregate([
          { $match: { userId: userObjId } },
          {
            $group: {
              _id: "$category",
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
              },
            },
          },
        ]),
      ]);

    const totalQuests = todayQuests.length;
    const completedQuests = todayQuests.filter(
      (q) => q.status === "COMPLETED"
    ).length;
    const pendingQuests = totalQuests - completedQuests;
    const dailyCompletionRate =
      totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

    return {
      profile: {
        displayName: profile?.displayName || "Hunter",
        timezone,
      },
      progression: progressionStats,
      dailyPerformance: {
        totalQuests,
        completedQuests,
        pendingQuests,
        dailyCompletionRate,
        todayXP: progressionStats.todayXP,
      },
      todayQuests: todayQuests.slice(0, 4), // Top 4 preview
      recentTasks,
      categories: categoryCounts.map((c) => ({
        category: c._id,
        total: c.total,
        completed: c.completed,
        percent: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
      })),
    };
  }
}

