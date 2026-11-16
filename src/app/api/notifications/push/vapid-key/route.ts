import { NextResponse } from "next/server";
import { PushService } from "@/features/notifications/services/push.service";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  const publicKey = PushService.getVapidPublicKey();
  return successResponse({ publicKey }, "VAPID public key retrieved");
}

