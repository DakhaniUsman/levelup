import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Quest, {
  IQuest,
  QUEST_DIFFICULTY_XP,
} from "@/models/Quest";
import QuestOccurrence, {
  IQuestOccurrence,
} from "@/models/QuestOccurrence";
import QuestCompletion from "@/models/QuestCompletion";
import { CreateQuestInput } from "../schemas/quest.schema";
import { XPService } from "@/features/progression/services/xp.service";

export interface PopulatedOccurrence extends Omit<IQuestOccurrence, "questId"> {
  questId: IQuest;
}

export class QuestService {
  /**
   * Helper to format current date in target timezone to YYYY-MM-DD
   */
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

  static async createQuest(
    userId: string | Types.ObjectId,
    input: CreateQuestInput,
    timezone = "UTC"
  ): Promise<IQuest> {
    await dbConnect();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const xpReward = QUEST_DIFFICULTY_XP[input.difficulty] || 10;

    const quest = await Quest.create({
      userId: userObjId,
      title: input.title.trim(),
      description: input.description?.trim() || "",
      category: input.category,
      difficulty: input.difficulty,
      xpReward,
      frequency: input.frequency,
      isActive: true,
    });

    // Synthesize today's occurrence immediately
    const todayStr = this.getTodayDateString(timezone);
    await QuestOccurrence.create({
      questId: quest._id,
      userId: userObjId,
      targetDate: todayStr,
      status: "PENDING",
    }).catch(() => {
      // Ignore duplicate key if already created
    });

    return quest;
  }

  static async getQuests(userId: string | Types.ObjectId): Promise<IQuest[]> {
    await dbConnect();
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;
    return Quest.find({ userId: userObjId, isActive: true }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Returns today's quest occurrences for the user.
   * Lazily synthesizes occurrences for active quests if they do not yet exist for today.
   */
  static async getTodayOccurrences(
    userId: string | Types.ObjectId,
    timezone = "UTC"
  ): Promise<PopulatedOccurrence[]> {
    await dbConnect();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const todayStr = this.getTodayDateString(timezone);

    // 1. Fetch all active quests for this user
    const activeQuests = await Quest.find({
      userId: userObjId,
      isActive: true,
    });

    // 2. Fetch existing occurrences for today
    const existingOccurrences = await QuestOccurrence.find({
      userId: userObjId,
      targetDate: todayStr,
    });

    const existingQuestIds = new Set(
      existingOccurrences.map((o) => o.questId.toString())
    );

    // 3. Synthesize missing occurrences for today
    const missingQuests = activeQuests.filter(
      (q) => !existingQuestIds.has(q._id.toString())
    );

    if (missingQuests.length > 0) {
      const newOccurrences = missingQuests.map((q) => ({
        questId: q._id,
        userId: userObjId,
        targetDate: todayStr,
        status: "PENDING",
      }));

      await QuestOccurrence.insertMany(newOccurrences, { ordered: false }).catch(
        () => {
          // Ignore duplicate keys on concurrent requests
        }
      );
    }

    // 4. Return populated occurrences
    const occurrences = await QuestOccurrence.find({
      userId: userObjId,
      targetDate: todayStr,
    })
      .populate<{ questId: IQuest }>("questId")
      .lean();

    return occurrences as unknown as PopulatedOccurrence[];
  }

  /**
   * Completes a quest occurrence, awards XP idempotently, and logs QuestCompletion
   */
  static async completeOccurrence(
    occurrenceId: string,
    userId: string | Types.ObjectId
  ): Promise<{
    occurrence: IQuestOccurrence;
    xpEarned: number;
    alreadyCompleted: boolean;
  }> {
    await dbConnect();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const occurrence = await QuestOccurrence.findOne({
      _id: occurrenceId,
      userId: userObjId,
    });

    if (!occurrence) {
      throw new Error("Quest occurrence not found or access denied.");
    }

    if (occurrence.status === "COMPLETED") {
      return {
        occurrence,
        xpEarned: 0,
        alreadyCompleted: true,
      };
    }

    const quest = await Quest.findById(occurrence.questId);
    if (!quest) {
      throw new Error("Associated quest definition missing.");
    }

    occurrence.status = "COMPLETED";
    occurrence.completedAt = new Date();
    await occurrence.save();

    // Award XP through central engine
    const xpResult = await XPService.awardXP({
      userId: userObjId,
      amount: quest.xpReward,
      sourceType: "QUEST",
      sourceId: occurrence._id.toString(),
      description: `Daily Quest Completed: ${quest.title} (${quest.difficulty})`,
    });

    // Create auditable QuestCompletion record
    await QuestCompletion.create({
      occurrenceId: occurrence._id,
      questId: quest._id,
      userId: userObjId,
      completedAt: occurrence.completedAt,
      xpTransactionId: xpResult.transaction._id,
    }).catch(() => {
      // Ignore if completion log already written
    });

    return {
      occurrence,
      xpEarned: xpResult.isNewReward ? quest.xpReward : 0,
      alreadyCompleted: false,
    };
  }
}

