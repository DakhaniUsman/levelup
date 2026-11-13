import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import UserProfile from "@/models/UserProfile";
import dbConnect from "@/lib/db";
import { z } from "zod";

const PenaltyProgressSchema = z.object({
  pushups: z.number().min(0).optional(),
  squats: z.number().min(0).optional(),
  steps: z.number().min(0).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    await dbConnect();
    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    const body = await req.json();
    const validated = PenaltyProgressSchema.parse(body);

    const protocol = await ProtocolService.logPenaltyProgress(
      session.userId,
      timezone,
      validated
    );

    return successResponse(protocol, "Penalty progress updated");
  } catch (error) {
    return handleApiError(error);
  }
}

