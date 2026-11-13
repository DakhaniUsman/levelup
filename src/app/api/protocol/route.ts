import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import UserProfile from "@/models/UserProfile";
import dbConnect from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    await dbConnect();
    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    const protocol = await ProtocolService.getOrCreateTodayProtocol(session.userId, timezone);
    return successResponse(protocol, "Today's Living Protocol retrieved");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    await dbConnect();
    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    const body = await req.json();
    const updatedProtocol = await ProtocolService.updateProtocol(session.userId, timezone, body);

    return successResponse(updatedProtocol, "Protocol checklist updated");
  } catch (error) {
    return handleApiError(error);
  }
}

