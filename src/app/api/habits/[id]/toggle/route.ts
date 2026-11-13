import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { HabitService } from "@/features/habits/services/habit.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import UserProfile from "@/models/UserProfile";
import dbConnect from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { id } = await params;

    await dbConnect();
    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    const result = await HabitService.toggleHabit(id, session.userId, timezone);
    return successResponse(result, "Habit status updated");
  } catch (error) {
    return handleApiError(error);
  }
}

