import { getSession } from "@/lib/session";
import { NotificationService } from "@/features/notifications/services/notification.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const data = await NotificationService.getNotifications(session.userId);
    return successResponse(data, "Notifications retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

