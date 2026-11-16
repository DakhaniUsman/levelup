import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { PushService } from "@/features/notifications/services/push.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

const unsubscribeSchema = z.object({
  endpoint: z.string().url("Valid push endpoint required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const validated = unsubscribeSchema.parse(body);

    const success = await PushService.unregisterSubscription(session.userId, validated.endpoint);
    return successResponse({ unregistered: success }, "Device push subscription deactivated");
  } catch (error) {
    return handleApiError(error);
  }
}

