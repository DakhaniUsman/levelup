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
    notes = ""
  ): Promise<IBodyWeight> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const entry = await BodyWeight.findOneAndUpdate(
      { userId: userObjId, date },
      { $set: { weightKg, notes } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return entry;
  }

  /**
   * Retrieves weight history and transformation progress calculations
   */
  static async getWeightStats(
    userId: string | Types.ObjectId,
    limit = 60
  ): Promise<WeightStats> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const [profile, entries] = await Promise.all([
      UserProfile.findOne({ userId: userObjId }).lean(),
      BodyWeight.find({ userId: userObjId }).sort({ date: 1 }).limit(limit).lean(),
    ]);

    const startingWeight = profile?.fitnessProfile?.startingWeightKg || 51;
    const targetWeight = profile?.fitnessProfile?.targetWeightKg || 65;

    const history = entries as unknown as IBodyWeight[];
    const latestEntry = history.length > 0 ? history[history.length - 1] : null;
    const currentWeight = latestEntry ? latestEntry.weightKg : startingWeight;

    const weightGained = Math.round((currentWeight - startingWeight) * 10) / 10;

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
    if (history.length >= 2) {
      const weekAgoIndex = Math.max(0, history.length - 7);
      weeklyChange = Math.round((currentWeight - history[weekAgoIndex].weightKg) * 10) / 10;
    }

    // Monthly change (trailing 30 entries)
    let monthlyChange = 0;
    if (history.length >= 2) {
      const monthAgoIndex = Math.max(0, history.length - 30);
      monthlyChange = Math.round((currentWeight - history[monthAgoIndex].weightKg) * 10) / 10;
    }

    return {
      currentWeight,
      startingWeight,
      targetWeight,
      weightGained,
      progressPercent,
      history,
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
