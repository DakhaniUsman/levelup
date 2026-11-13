import { getSession } from "@/lib/session";
import { AchievementService } from "@/features/achievements/services/achievement.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const result = await AchievementService.checkAndUnlockAchievements(session.userId);
    return successResponse(result, "Achievement scan completed");
  } catch (error) {
    return handleApiError(error);
  }
}

