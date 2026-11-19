import { getSession } from "@/lib/session";
import { FitnessAnalyticsService } from "@/features/fitness/services/fitness-analytics.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const stats = await FitnessAnalyticsService.getOverviewAnalytics(session.userId);
    const exercises = await FitnessAnalyticsService.getAvailableExercises(session.userId);

    return successResponse(
      { stats, exercises },
      "Fitness overview analytics retrieved successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
