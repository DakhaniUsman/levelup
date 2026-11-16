import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { PushService } from "@/features/notifications/services/push.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

const subscribeSchema = z.object({
  endpoint: z.string().url("Valid push endpoint required"),
  keys: z.object({
    p256dh: z.string().min(1, "p256dh key required"),
    auth: z.string().min(1, "auth key required"),
  }),
  userAgent: z.string().optional(),
  deviceLabel: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const validated = subscribeSchema.parse(body);

    const subscription = await PushService.registerSubscription(
      session.userId,
      {
        endpoint: validated.endpoint,
        keys: validated.keys,
      },
      validated.userAgent,
      validated.deviceLabel
    );

    return successResponse(subscription, "Device push subscription registered successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

