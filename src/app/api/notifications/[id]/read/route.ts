import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { NotificationService } from "@/features/notifications/services/notification.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { id } = await params;
    const modified = await NotificationService.markAsRead(id, session.userId);
    return successResponse({ read: modified }, "Notification marked as read");
  } catch (error) {
    return handleApiError(error);
  }
}

