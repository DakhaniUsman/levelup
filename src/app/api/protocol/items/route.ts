import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { ProtocolItemService } from "@/features/protocol/services/protocol-item.service";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import { CreateProtocolItemSchema } from "@/features/protocol/schemas/protocol-item.schema";
import { ProtocolSphere } from "@/models/ProtocolItem";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import UserProfile from "@/models/UserProfile";
import dbConnect from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { searchParams } = new URL(req.url);
    const sphere = searchParams.get("sphere") as ProtocolSphere | null;

    const items = await ProtocolItemService.getItems(
      session.userId,
      sphere || undefined
    );

    return successResponse(items, "Protocol items retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const validated = CreateProtocolItemSchema.parse(body);

    await dbConnect();
    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";
    const todayDateStr = ProtocolService.getTodayDateString(timezone);

    const item = await ProtocolItemService.createItem(
      session.userId,
      validated,
      todayDateStr
    );

    return successResponse(item, "Protocol activity created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

