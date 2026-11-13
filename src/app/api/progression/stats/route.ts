import { getSession } from "@/lib/session";
import { XPService } from "@/features/progression/services/xp.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const stats = await XPService.getProgressionStats(session.userId);
    return successResponse(stats, "Progression stats retrieved");
  } catch (error) {
    return handleApiError(error);
  }
}

