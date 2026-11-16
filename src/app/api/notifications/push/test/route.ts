import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { PushService } from "@/features/notifications/services/push.service";
import { NotificationService } from "@/features/notifications/services/notification.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const testTitle = "SYSTEM ALERT: LINK ESTABLISHED";
    const testMessage = "Hunter telemetry connected. Mobile push channel is fully operational.";

    // 1. In-app notification
    await NotificationService.createNotification(session.userId, {
      title: testTitle,
      message: testMessage,
      type: "SYSTEM",
      link: "/settings/notifications",
    });

    // 2. Web Push dispatch
    const pushResult = await PushService.sendPushToUser(session.userId, {
      title: testTitle,
      body: testMessage,
      url: "/settings/notifications",
      tag: "test-alert-" + Date.now(),
    });

    return successResponse(
      pushResult,
      pushResult.successful > 0
        ? `Test notification dispatched to ${pushResult.successful} active device(s)`
        : "Notification sent, but no active device subscriptions found. Please enable push on this device."
    );
  } catch (error) {
    return handleApiError(error);
  }
}

