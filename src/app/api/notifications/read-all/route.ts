import { getSession } from "@/lib/session";
import { NotificationService } from "@/features/notifications/services/notification.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const count = await NotificationService.markAllAsRead(session.userId);
    return successResponse({ count }, "All notifications marked as read");
  } catch (error) {
    return handleApiError(error);
  }
}

