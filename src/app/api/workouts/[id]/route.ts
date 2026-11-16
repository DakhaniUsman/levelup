import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/db";
import Workout from "@/models/Workout";
import UserProfile from "@/models/UserProfile";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";
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

const UpdateWorkoutSchema = z.object({
  split: z.enum(["PUSH", "PULL", "LEGS", "UPPER", "LOWER", "CUSTOM"]).optional(),
  title: z.string().min(1).max(100).optional(),
  durationMinutes: z.number().min(5).max(300).optional(),
  intensityRating: z.number().min(1).max(10).optional(),
  exercises: z.array(WorkoutExerciseSchema).min(1).optional(),
  notes: z.string().optional(),
  targetDate: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { id } = await params;
    await dbConnect();

    const workout = await Workout.findOne({ _id: id, userId: session.userId });
    if (!workout) {
      return errorResponse("Workout record not found", "NOT_FOUND", 404);
    }

    return successResponse(workout, "Workout session retrieved");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { id } = await params;
    const body = await req.json();
    const validated = UpdateWorkoutSchema.parse(body);

    await dbConnect();
    const workout = await Workout.findOne({ _id: id, userId: session.userId });
    if (!workout) {
      return errorResponse("Workout record not found", "NOT_FOUND", 404);
    }

    if (validated.split !== undefined) workout.split = validated.split;
    if (validated.title !== undefined) workout.title = validated.title;
    if (validated.durationMinutes !== undefined) workout.durationMinutes = validated.durationMinutes;
    if (validated.intensityRating !== undefined) workout.intensityRating = validated.intensityRating;
    if (validated.exercises !== undefined) workout.exercises = validated.exercises;
    if (validated.notes !== undefined) workout.notes = validated.notes;
    if (validated.targetDate !== undefined) workout.targetDate = validated.targetDate;

    await workout.save();

    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    // Synchronize daily protocol status
    await ProtocolService.syncWorkoutStatus(session.userId, timezone);

    return successResponse(workout, "Workout updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { id } = await params;
    await dbConnect();

    const workout = await Workout.findOneAndDelete({
      _id: id,
      userId: session.userId,
    });

    if (!workout) {
      return errorResponse("Workout record not found", "NOT_FOUND", 404);
    }

    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    // Synchronize daily protocol status across modules
    await ProtocolService.syncWorkoutStatus(session.userId, timezone);

    return successResponse(
      { deletedId: id },
      "Workout session deleted and daily protocol synchronized successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
