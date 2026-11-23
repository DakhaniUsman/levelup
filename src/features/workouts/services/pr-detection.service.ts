import { Types } from "mongoose";
import Workout, { IWorkoutExercise, IWorkoutSet, PRType } from "@/models/Workout";

export interface NewPRAchievement {
  exerciseName: string;
  setNumber: number;
  prType: "WEIGHT_PR" | "REPS_PR";
  previousValue: number;
  newValue: number;
  weightKg: number;
  reps: number;
}

export interface DetectPRResult {
  exercises: IWorkoutExercise[];
  newPRs: NewPRAchievement[];
}

export class PRDetectionService {
  /**
   * Automatically evaluates all sets against user's historical records.
   * Auto-assigns isPersonalRecord and prType ('WEIGHT_PR' vs 'REPS_PR').
   */
  static async detectAndTagPRs(
    userId: string | Types.ObjectId,
    exercises: IWorkoutExercise[],
    excludeWorkoutId?: string | Types.ObjectId
  ): Promise<DetectPRResult> {
    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    // 1. Fetch all prior workouts for this user
    const filter: any = { userId: userObjId };
    if (excludeWorkoutId) {
      filter._id = {
        $ne:
          typeof excludeWorkoutId === "string"
            ? new Types.ObjectId(excludeWorkoutId)
            : excludeWorkoutId,
      };
    }

    const priorWorkouts = await Workout.find(filter).lean();
    const newPRs: NewPRAchievement[] = [];

    // 2. Evaluate each exercise
    const processedExercises = exercises.map((ex) => {
      const normalizedName = ex.exerciseName.trim().toLowerCase();

      // Find prior max weight and max reps for this exercise
      let historicalMaxWeight = 0;
      let historicalMaxRepsAtMaxWeight = 0;

      for (const w of priorWorkouts) {
        for (const e of w.exercises || []) {
          if (e.exerciseName.trim().toLowerCase() === normalizedName) {
            for (const s of e.sets || []) {
              if (s.weightKg > historicalMaxWeight) {
                historicalMaxWeight = s.weightKg;
                historicalMaxRepsAtMaxWeight = s.reps;
              } else if (
                s.weightKg === historicalMaxWeight &&
                s.reps > historicalMaxRepsAtMaxWeight
              ) {
                historicalMaxRepsAtMaxWeight = s.reps;
              }
            }
          }
        }
      }

      // Track running PRs within the current session
      let sessionMaxWeight = historicalMaxWeight;
      let sessionMaxRepsAtMaxWeight = historicalMaxRepsAtMaxWeight;

      const processedSets: IWorkoutSet[] = ex.sets.map((s) => {
        let isPR = false;
        let prType: PRType = null;

        if (s.weightKg > sessionMaxWeight && s.weightKg > 0) {
          isPR = true;
          prType = "WEIGHT_PR";
          newPRs.push({
            exerciseName: ex.exerciseName,
            setNumber: s.setNumber,
            prType: "WEIGHT_PR",
            previousValue: sessionMaxWeight,
            newValue: s.weightKg,
            weightKg: s.weightKg,
            reps: s.reps,
          });
          sessionMaxWeight = s.weightKg;
          sessionMaxRepsAtMaxWeight = s.reps;
        } else if (
          s.weightKg === sessionMaxWeight &&
          s.weightKg > 0 &&
          s.reps > sessionMaxRepsAtMaxWeight
        ) {
          isPR = true;
          prType = "REPS_PR";
          newPRs.push({
            exerciseName: ex.exerciseName,
            setNumber: s.setNumber,
            prType: "REPS_PR",
            previousValue: sessionMaxRepsAtMaxWeight,
            newValue: s.reps,
            weightKg: s.weightKg,
            reps: s.reps,
          });
          sessionMaxRepsAtMaxWeight = s.reps;
        }

        return {
          setNumber: s.setNumber,
          reps: s.reps,
          weightKg: s.weightKg,
          isPersonalRecord: isPR,
          prType,
        };
      });

      return {
        ...ex,
        sets: processedSets,
      };
    });

    return { exercises: processedExercises, newPRs };
  }
}
