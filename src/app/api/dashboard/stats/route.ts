import { getSession } from "@/lib/session";
import { DashboardService } from "@/features/dashboard/services/dashboard.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const data = await DashboardService.getDashboardData(session.userId);
    return successResponse(data, "Dashboard data retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

