import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Workout, { IWorkout, IWorkoutSet } from "@/models/Workout";
import {
  MuscleGroup,
  PPLSplit,
  getExerciseMetadata,
  EXERCISE_DEFINITIONS,
} from "../constants/exercises";

export interface ExerciseSessionRecord {
  workoutId: string;
  date: string;
  split: string;
  sets: IWorkoutSet[];
  maxWeightKg: number;
  maxReps: number;
  estimatedOneRepMax: number;
  totalVolumeKg: number;
}

export interface ExerciseProgressionData {
  exerciseName: string;
  split: PPLSplit;
  primaryMuscle: MuscleGroup;
  totalSessions: number;
  records: ExerciseSessionRecord[];
  personalRecords: {
    maxWeight: { value: number; date: string };
    maxOneRepMax: { value: number; date: string };
    maxVolume: { value: number; date: string };
  };
  latestDelta?: {
    weightDelta: number;
    repsDelta: number;
    oneRepMaxDelta: number;
    volumeDelta: number;
  };
}

export interface PPLStats {
  sessions: number;
  totalVolume: number;
  lastSessionDate: string | null;
}

export interface FitnessOverviewStats {
  totalWorkouts: number;
  workoutsThisMonth: number;
  weeklyFrequency: number; // average sessions per week last 4 weeks
  totalVolumeLifetime: number;
  totalVolumeThisMonth: number;
  totalPRsCount: number;
  latestWorkout: {
    title: string;
    split: string;
    date: string;
    durationMinutes: number;
    exercisesCount: number;
  } | null;
  pplBreakdown: {
    PUSH: PPLStats;
    PULL: PPLStats;
    LEGS: PPLStats;
    OTHER: PPLStats;
  };
  muscleGroupFrequencyWeekly: Record<MuscleGroup, { count: number; target: number; status: "MET" | "UNDER" }>;
}

export class FitnessAnalyticsService {
  /**
   * Calculates estimated 1-Rep Max using the Epley formula
   */
  static calculate1RM(weightKg: number, reps: number): number {
    if (weightKg <= 0 || reps <= 0) return 0;
    if (reps === 1) return weightKg;
    return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
  }

  /**
   * Retrieves high-level workout and PPL analytics for the user
   */
  static async getOverviewAnalytics(userId: string | Types.ObjectId): Promise<FitnessOverviewStats> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const allWorkouts = await Workout.find({ userId: userObjId })
      .sort({ targetDate: -1, createdAt: -1 })
      .lean();

    const now = new Date();
    const currentMonthPrefix = now.toISOString().slice(0, 7); // "YYYY-MM"

    // 28 days ago date string
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const fourWeeksAgoStr = fourWeeksAgo.toISOString().slice(0, 10);

    // 7 days ago date string
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    let totalVolumeLifetime = 0;
    let totalVolumeThisMonth = 0;
    let workoutsThisMonth = 0;
    let workoutsLast4Weeks = 0;
    let totalPRsCount = 0;

    const pplBreakdown = {
      PUSH: { sessions: 0, totalVolume: 0, lastSessionDate: null as string | null },
      PULL: { sessions: 0, totalVolume: 0, lastSessionDate: null as string | null },
      LEGS: { sessions: 0, totalVolume: 0, lastSessionDate: null as string | null },
      OTHER: { sessions: 0, totalVolume: 0, lastSessionDate: null as string | null },
    };

    // Muscle group days in last 7 days
    const muscleDaysMap: Record<MuscleGroup, Set<string>> = {
      CHEST: new Set(),
      SHOULDERS: new Set(),
      TRICEPS: new Set(),
      BACK: new Set(),
      BICEPS: new Set(),
      QUADRICEPS: new Set(),
      HAMSTRINGS: new Set(),
      CALVES: new Set(),
      CORE: new Set(),
    };

    for (const w of allWorkouts) {
      let sessionVolume = 0;
      const isThisMonth = w.targetDate.startsWith(currentMonthPrefix);
      if (isThisMonth) workoutsThisMonth++;
      if (w.targetDate >= fourWeeksAgoStr) workoutsLast4Weeks++;

      for (const ex of w.exercises || []) {
        const meta = getExerciseMetadata(ex.exerciseName);

        // Record muscle group if in last 7 days
        if (w.targetDate >= sevenDaysAgoStr && muscleDaysMap[meta.primaryMuscle]) {
          muscleDaysMap[meta.primaryMuscle].add(w.targetDate);
        }

        for (const set of ex.sets || []) {
          const vol = (set.weightKg || 0) * (set.reps || 0);
          sessionVolume += vol;
          if (set.isPersonalRecord) totalPRsCount++;
        }
      }

      totalVolumeLifetime += sessionVolume;
      if (isThisMonth) totalVolumeThisMonth += sessionVolume;

      // PPL split aggregation
      const splitKey = (w.split === "PUSH" || w.split === "PULL" || w.split === "LEGS") ? w.split : "OTHER";
      pplBreakdown[splitKey].sessions++;
      pplBreakdown[splitKey].totalVolume += sessionVolume;
      if (!pplBreakdown[splitKey].lastSessionDate) {
        pplBreakdown[splitKey].lastSessionDate = w.targetDate;
      }
    }

    const weeklyFrequency = Math.round((workoutsLast4Weeks / 4) * 10) / 10;

    // Muscle frequency status (target: 2x per week)
    const muscleGroupFrequencyWeekly: any = {};
    for (const [muscle, daySet] of Object.entries(muscleDaysMap)) {
      const count = daySet.size;
      muscleGroupFrequencyWeekly[muscle] = {
        count,
        target: 2,
        status: count >= 2 ? "MET" : "UNDER",
      };
    }

    const latest = allWorkouts.length > 0 ? allWorkouts[0] : null;

    return {
      totalWorkouts: allWorkouts.length,
      workoutsThisMonth,
      weeklyFrequency,
      totalVolumeLifetime,
      totalVolumeThisMonth,
      totalPRsCount,
      latestWorkout: latest
        ? {
            title: latest.title,
            split: latest.split,
            date: latest.targetDate,
            durationMinutes: latest.durationMinutes,
            exercisesCount: (latest.exercises || []).length,
          }
        : null,
      pplBreakdown,
      muscleGroupFrequencyWeekly,
    };
  }

  /**
   * Computes progression tracking for a specific exercise across historical sessions
   */
  static async getExerciseProgression(
    userId: string | Types.ObjectId,
    exerciseName: string
  ): Promise<ExerciseProgressionData> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const normalizedName = exerciseName.trim().toLowerCase();
    const metadata = getExerciseMetadata(exerciseName);

    // Find workouts containing this exercise
    const workouts = await Workout.find({
      userId: userObjId,
      "exercises.exerciseName": { $regex: new RegExp(`^${normalizedName}$`, "i") },
    })
      .sort({ targetDate: 1, createdAt: 1 })
      .lean();

    const records: ExerciseSessionRecord[] = [];
    const maxWeightPR = { value: 0, date: "" };
    const max1RMPR = { value: 0, date: "" };
    const maxVolumePR = { value: 0, date: "" };

    for (const w of workouts) {
      const matchingEx = (w.exercises || []).find(
        (e) => e.exerciseName.trim().toLowerCase() === normalizedName
      );
      if (!matchingEx || !matchingEx.sets || matchingEx.sets.length === 0) continue;

      let sessionMaxWeight = 0;
      let sessionMaxReps = 0;
      let sessionMax1RM = 0;
      let sessionVolume = 0;

      for (const s of matchingEx.sets) {
        const weight = s.weightKg || 0;
        const reps = s.reps || 0;
        const vol = weight * reps;
        sessionVolume += vol;

        if (weight > sessionMaxWeight) {
          sessionMaxWeight = weight;
          sessionMaxReps = reps;
        }

        const est1RM = this.calculate1RM(weight, reps);
        if (est1RM > sessionMax1RM) {
          sessionMax1RM = est1RM;
        }
      }

      // Check PRs
      if (sessionMaxWeight > maxWeightPR.value) {
        maxWeightPR.value = sessionMaxWeight;
        maxWeightPR.date = w.targetDate;
      }
      if (sessionMax1RM > max1RMPR.value) {
        max1RMPR.value = sessionMax1RM;
        max1RMPR.date = w.targetDate;
      }
      if (sessionVolume > maxVolumePR.value) {
        maxVolumePR.value = sessionVolume;
        maxVolumePR.date = w.targetDate;
      }

      records.push({
        workoutId: w._id.toString(),
        date: w.targetDate,
        split: w.split,
        sets: matchingEx.sets,
        maxWeightKg: sessionMaxWeight,
        maxReps: sessionMaxReps,
        estimatedOneRepMax: sessionMax1RM,
        totalVolumeKg: sessionVolume,
      });
    }

    // Calculate delta between latest session and previous session
    let latestDelta;
    if (records.length >= 2) {
      const latest = records[records.length - 1];
      const prev = records[records.length - 2];
      latestDelta = {
        weightDelta: Math.round((latest.maxWeightKg - prev.maxWeightKg) * 10) / 10,
        repsDelta: latest.maxReps - prev.maxReps,
        oneRepMaxDelta: Math.round((latest.estimatedOneRepMax - prev.estimatedOneRepMax) * 10) / 10,
        volumeDelta: Math.round((latest.totalVolumeKg - prev.totalVolumeKg) * 10) / 10,
      };
    }

    return {
      exerciseName,
      split: metadata.split,
      primaryMuscle: metadata.primaryMuscle,
      totalSessions: records.length,
      records,
      personalRecords: {
        maxWeight: maxWeightPR,
        maxOneRepMax: max1RMPR,
        maxVolume: maxVolumePR,
      },
      latestDelta,
    };
  }

  /**
   * Retrieves list of all exercises logged by the user + default taxonomy
   */
  static async getAvailableExercises(userId: string | Types.ObjectId): Promise<string[]> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const loggedExercises = await Workout.distinct("exercises.exerciseName", { userId: userObjId });
    const standardNames = EXERCISE_DEFINITIONS.map((e) => e.name);

    // Merge and deduplicate
    const set = new Set<string>();
    for (const name of loggedExercises) {
      if (name && typeof name === "string") set.add(name.trim());
    }
    for (const name of standardNames) {
      set.add(name);
    }

    return Array.from(set).sort();
  }
}
