import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { HabitService } from "@/features/habits/services/habit.service";
import { CreateHabitSchema } from "@/features/habits/schemas/habit.schema";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import UserProfile from "@/models/UserProfile";
import dbConnect from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    await dbConnect();
    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    const habits = await HabitService.getHabits(session.userId, timezone);
    return successResponse(habits, "Habits retrieved successfully");
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

    const json = await req.json();
    const validatedData = CreateHabitSchema.parse(json);
    const habit = await HabitService.createHabit(session.userId, validatedData);

    return successResponse(habit, "Habit directive registered successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

