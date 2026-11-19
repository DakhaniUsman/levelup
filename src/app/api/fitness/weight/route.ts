import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { BodyWeightService } from "@/features/fitness/services/body-weight.service";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import UserProfile from "@/models/UserProfile";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

const LogWeightSchema = z.object({
  weightKg: z.number().min(20, "Weight must be at least 20 kg").max(300, "Weight cannot exceed 300 kg"),
  date: z.string().optional(),
  notes: z.string().max(200).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "60", 10);

    const stats = await BodyWeightService.getWeightStats(session.userId, limit);
    return successResponse(stats, "Weight transformation history retrieved successfully");
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

    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    const body = await req.json();
    const validated = LogWeightSchema.parse(body);
    const date = validated.date || ProtocolService.getTodayDateString(timezone);

    const entry = await BodyWeightService.logWeight(
      session.userId,
      date,
      validated.weightKg,
      validated.notes || ""
    );

    return successResponse(entry, "Weight measurement recorded successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
