import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { FitnessAnalyticsService } from "@/features/fitness/services/fitness-analytics.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { searchParams } = new URL(req.url);
    const exercise = searchParams.get("exercise") || "Dumbbell Bench Press";

    const progression = await FitnessAnalyticsService.getExerciseProgression(
      session.userId,
      exercise
    );

    return successResponse(progression, `Progression data for ${exercise} retrieved`);
  } catch (error) {
    return handleApiError(error);
  }
}
