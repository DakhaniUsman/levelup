import { getSession } from "@/lib/session";
import { AchievementService } from "@/features/achievements/services/achievement.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const achievements = await AchievementService.getUserAchievements(session.userId);
    return successResponse(achievements, "Achievements retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

