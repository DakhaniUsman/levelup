import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import BodyWeight, { IBodyWeight } from "@/models/BodyWeight";
import UserProfile from "@/models/UserProfile";

export interface WeightStats {
  currentWeight: number;
  startingWeight: number;
  targetWeight: number;
  weightGained: number; // current - start
  progressPercent: number; // based on target
  remainingKg: number;
  timeElapsedDays: number;
  history: IBodyWeight[];
  weeklyChange: number; // delta in last 7 days
  monthlyChange: number; // delta in last 30 days
}

export class BodyWeightService {
  /**
   * Logs or updates a daily body weight entry
   */
  static async logWeight(
    userId: string | Types.ObjectId,
    date: string,
    weightKg: number,
    notes = "",
    recordedAt?: Date
  ): Promise<IBodyWeight> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const entry = await BodyWeight.findOneAndUpdate(
      { userId: userObjId, date },
      { $set: { weightKg, notes, recordedAt: recordedAt || new Date() } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return entry;
  }

  /**
   * Retrieves weight history and transformation progress calculations
   */
  static async getWeightStats(
    userId: string | Types.ObjectId,
    rangeOrLimit: string | number = "ALL",
    limit = 365
  ): Promise<WeightStats> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const range = typeof rangeOrLimit === "string" ? rangeOrLimit : "ALL";
    const actualLimit = typeof rangeOrLimit === "number" ? rangeOrLimit : limit;

    const [profile, allEntries] = await Promise.all([
      UserProfile.findOne({ userId: userObjId }).lean(),
      BodyWeight.find({ userId: userObjId }).sort({ date: 1, recordedAt: 1 }).limit(actualLimit).lean(),
    ]);

    const startingWeight = profile?.fitnessProfile?.startingWeightKg || 51;
    const targetWeight = profile?.fitnessProfile?.targetWeightKg || 65;

    const fullHistory = allEntries as unknown as IBodyWeight[];
    const latestEntry = fullHistory.length > 0 ? fullHistory[fullHistory.length - 1] : null;
    const currentWeight = latestEntry ? latestEntry.weightKg : startingWeight;

    const weightGained = Math.round((currentWeight - startingWeight) * 10) / 10;
    const remainingKg = Math.max(0, Math.round((targetWeight - currentWeight) * 10) / 10);

    // Progress percentage towards target
    const totalTargetDelta = targetWeight - startingWeight;
    let progressPercent = 0;
    if (totalTargetDelta > 0) {
      progressPercent = Math.min(
        100,
        Math.max(0, Math.round(((currentWeight - startingWeight) / totalTargetDelta) * 100))
      );
    }

    // Weekly change (trailing 7 entries or 7 days)
    let weeklyChange = 0;
    if (fullHistory.length >= 2) {
      const weekAgoIndex = Math.max(0, fullHistory.length - 7);
      weeklyChange = Math.round((currentWeight - fullHistory[weekAgoIndex].weightKg) * 10) / 10;
    }

    // Monthly change (trailing 30 entries)
    let monthlyChange = 0;
    if (fullHistory.length >= 2) {
      const monthAgoIndex = Math.max(0, fullHistory.length - 30);
      monthlyChange = Math.round((currentWeight - fullHistory[monthAgoIndex].weightKg) * 10) / 10;
    }

    // Days elapsed
    let timeElapsedDays = 0;
    if (fullHistory.length > 0) {
      const firstDate = new Date(fullHistory[0].recordedAt || fullHistory[0].date);
      const diffTime = Math.abs(Date.now() - firstDate.getTime());
      timeElapsedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Range filtering
    let filteredHistory = fullHistory;
    const now = new Date();
    if (range === "7D") {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      filteredHistory = fullHistory.filter((e) => e.date >= cutoff);
    } else if (range === "30D") {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      filteredHistory = fullHistory.filter((e) => e.date >= cutoff);
    } else if (range === "3M") {
      const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      filteredHistory = fullHistory.filter((e) => e.date >= cutoff);
    } else if (range === "6M") {
      const cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      filteredHistory = fullHistory.filter((e) => e.date >= cutoff);
    } else if (range === "1Y") {
      const cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      filteredHistory = fullHistory.filter((e) => e.date >= cutoff);
    }

    return {
      currentWeight,
      startingWeight,
      targetWeight,
      weightGained,
      progressPercent,
      remainingKg,
      timeElapsedDays,
      history: filteredHistory,
      weeklyChange,
      monthlyChange,
    };
  }

  /**
   * Updates an existing weight entry
   */
  static async updateWeight(
    id: string,
    userId: string | Types.ObjectId,
    updateData: { weightKg?: number; notes?: string; date?: string }
  ): Promise<IBodyWeight | null> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const updated = await BodyWeight.findOneAndUpdate(
      { _id: id, userId: userObjId },
      { $set: updateData },
      { new: true }
    );

    return updated;
  }

  /**
   * Deletes a weight entry
   */
  static async deleteWeight(
    id: string,
    userId: string | Types.ObjectId
  ): Promise<boolean> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const result = await BodyWeight.deleteOne({ _id: id, userId: userObjId });
    return result.deletedCount > 0;
  }

  /**
   * Updates user fitness transformation profile
   */
  static async updateFitnessProfile(
    userId: string | Types.ObjectId,
    profileData: { startingWeightKg?: number; targetWeightKg?: number; weeklyPplGoal?: number }
  ) {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const updateFields: any = {};
    if (profileData.startingWeightKg !== undefined) {
      updateFields["fitnessProfile.startingWeightKg"] = profileData.startingWeightKg;
    }
    if (profileData.targetWeightKg !== undefined) {
      updateFields["fitnessProfile.targetWeightKg"] = profileData.targetWeightKg;
    }
    if (profileData.weeklyPplGoal !== undefined) {
      updateFields["fitnessProfile.weeklyPplGoal"] = profileData.weeklyPplGoal;
    }

    const updated = await UserProfile.findOneAndUpdate(
      { userId: userObjId },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    return updated?.fitnessProfile;
  }
}
