import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/db";
import Workout from "@/models/Workout";
import UserProfile from "@/models/UserProfile";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import { XPService } from "@/features/progression/services/xp.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const WorkoutSetSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(1),
  weightKg: z.number().min(0),
  isPersonalRecord: z.boolean().optional(),
});

const WorkoutExerciseSchema = z.object({
  exerciseName: z.string().min(1, "Exercise name required"),
  sets: z.array(WorkoutSetSchema).min(1, "At least one set required"),
  notes: z.string().optional(),
});

const CreateWorkoutSchema = z.object({
  split: z.enum(["PUSH", "PULL", "LEGS", "UPPER", "LOWER", "CUSTOM"]),
  title: z.string().min(1, "Workout title required").max(100),
  durationMinutes: z.number().min(5).max(300).default(60),
  intensityRating: z.number().min(1).max(10).default(8),
  exercises: z.array(WorkoutExerciseSchema).min(1, "At least one exercise required"),
  notes: z.string().optional(),
  targetDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const workouts = await Workout.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return successResponse(workouts, "Workouts retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    await dbConnect();
    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    const body = await req.json();
    const validated = CreateWorkoutSchema.parse(body);
    const targetDate = validated.targetDate || ProtocolService.getTodayDateString(timezone);

    const workout = await Workout.create({
      userId: session.userId,
      targetDate,
      split: validated.split,
      title: validated.title,
      durationMinutes: validated.durationMinutes,
      intensityRating: validated.intensityRating,
      exercises: validated.exercises,
      notes: validated.notes || "",
    });

    // Auto-mark gym workout in daily protocol
    await ProtocolService.updateProtocol(session.userId, timezone, {
      physically: { gymWorkout: true },
    });

    // Award Hunter Workout XP (+75 XP)
    await XPService.awardXP({
      userId: session.userId,
      amount: 75,
      sourceType: "MANUAL_ADJUSTMENT",
      sourceId: `WORKOUT:${workout._id}`,
      description: `Heavy Physical Training Cleared: ${validated.title} [${validated.split}] (+75 XP)`,
    });

    return successResponse(workout, "Workout session logged & XP awarded", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

