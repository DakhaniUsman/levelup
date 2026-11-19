export type MuscleGroup =
  | "CHEST"
  | "SHOULDERS"
  | "TRICEPS"
  | "BACK"
  | "BICEPS"
  | "QUADRICEPS"
  | "HAMSTRINGS"
  | "CALVES"
  | "CORE";

export type PPLSplit = "PUSH" | "PULL" | "LEGS" | "UPPER" | "LOWER" | "CUSTOM";

export interface ExerciseDefinition {
  name: string;
  split: PPLSplit;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  isBodyweight?: boolean;
}

export const EXERCISE_DEFINITIONS: ExerciseDefinition[] = [
  // PUSH — Chest, Shoulders, Triceps
  { name: "Barbell Bench Press", split: "PUSH", primaryMuscle: "CHEST", secondaryMuscles: ["TRICEPS", "SHOULDERS"] },
  { name: "Dumbbell Bench Press", split: "PUSH", primaryMuscle: "CHEST", secondaryMuscles: ["TRICEPS", "SHOULDERS"] },
  { name: "Incline Dumbbell Press", split: "PUSH", primaryMuscle: "CHEST", secondaryMuscles: ["SHOULDERS", "TRICEPS"] },
  { name: "Overhead Shoulder Press", split: "PUSH", primaryMuscle: "SHOULDERS", secondaryMuscles: ["TRICEPS"] },
  { name: "Dumbbell Lateral Raise", split: "PUSH", primaryMuscle: "SHOULDERS" },
  { name: "Tricep Rope Pushdown", split: "PUSH", primaryMuscle: "TRICEPS" },
  { name: "Skull Crushers", split: "PUSH", primaryMuscle: "TRICEPS" },
  { name: "Dips", split: "PUSH", primaryMuscle: "TRICEPS", secondaryMuscles: ["CHEST"], isBodyweight: true },
  { name: "Pushups", split: "PUSH", primaryMuscle: "CHEST", secondaryMuscles: ["TRICEPS"], isBodyweight: true },

  // PULL — Back, Biceps
  { name: "Deadlift", split: "PULL", primaryMuscle: "BACK", secondaryMuscles: ["HAMSTRINGS"] },
  { name: "Barbell Row", split: "PULL", primaryMuscle: "BACK", secondaryMuscles: ["BICEPS"] },
  { name: "Lat Pulldown", split: "PULL", primaryMuscle: "BACK", secondaryMuscles: ["BICEPS"] },
  { name: "Seated Cable Row", split: "PULL", primaryMuscle: "BACK", secondaryMuscles: ["BICEPS"] },
  { name: "Face Pulls", split: "PULL", primaryMuscle: "SHOULDERS", secondaryMuscles: ["BACK"] },
  { name: "Barbell Bicep Curl", split: "PULL", primaryMuscle: "BICEPS" },
  { name: "Dumbbell Hammer Curl", split: "PULL", primaryMuscle: "BICEPS" },
  { name: "Incline Dumbbell Curl", split: "PULL", primaryMuscle: "BICEPS" },
  { name: "Pull-ups", split: "PULL", primaryMuscle: "BACK", secondaryMuscles: ["BICEPS"], isBodyweight: true },

  // LEGS — Quads, Hamstrings, Calves
  { name: "Barbell Back Squat", split: "LEGS", primaryMuscle: "QUADRICEPS", secondaryMuscles: ["HAMSTRINGS"] },
  { name: "Leg Press", split: "LEGS", primaryMuscle: "QUADRICEPS" },
  { name: "Romanian Deadlift", split: "LEGS", primaryMuscle: "HAMSTRINGS" },
  { name: "Leg Extension", split: "LEGS", primaryMuscle: "QUADRICEPS" },
  { name: "Hamstring Leg Curl", split: "LEGS", primaryMuscle: "HAMSTRINGS" },
  { name: "Standing Calf Raise", split: "LEGS", primaryMuscle: "CALVES" },
  { name: "Seated Calf Raise", split: "LEGS", primaryMuscle: "CALVES" },
  { name: "Walking Lunges", split: "LEGS", primaryMuscle: "QUADRICEPS", secondaryMuscles: ["HAMSTRINGS"] },
  { name: "Bulgarian Split Squat", split: "LEGS", primaryMuscle: "QUADRICEPS", secondaryMuscles: ["HAMSTRINGS"] },
];

/**
 * Returns the primary muscle group and split for any exercise name (case-insensitive fuzzy match)
 */
export function getExerciseMetadata(name: string): { split: PPLSplit; primaryMuscle: MuscleGroup } {
  const normalized = name.trim().toLowerCase();
  const found = EXERCISE_DEFINITIONS.find((e) => e.name.toLowerCase() === normalized);
  if (found) {
    return { split: found.split, primaryMuscle: found.primaryMuscle };
  }

  // Fallback heuristics based on keywords
  if (/bench|chest|pec|dip|pushup|fly|incline/i.test(normalized)) {
    return { split: "PUSH", primaryMuscle: "CHEST" };
  }
  if (/shoulder|overhead|lateral|military|deltoid/i.test(normalized)) {
    return { split: "PUSH", primaryMuscle: "SHOULDERS" };
  }
  if (/tricep|pushdown|skull/i.test(normalized)) {
    return { split: "PUSH", primaryMuscle: "TRICEPS" };
  }
  if (/lat|pull|row|back|deadlift|chin/i.test(normalized)) {
    return { split: "PULL", primaryMuscle: "BACK" };
  }
  if (/bicep|curl|hammer/i.test(normalized)) {
    return { split: "PULL", primaryMuscle: "BICEPS" };
  }
  if (/squat|quad|lunge|leg press|extension/i.test(normalized)) {
    return { split: "LEGS", primaryMuscle: "QUADRICEPS" };
  }
  if (/hamstring|rdl|romanian|curl/i.test(normalized)) {
    return { split: "LEGS", primaryMuscle: "HAMSTRINGS" };
  }
  if (/calf|calves/i.test(normalized)) {
    return { split: "LEGS", primaryMuscle: "CALVES" };
  }

  return { split: "CUSTOM", primaryMuscle: "CHEST" };
}
