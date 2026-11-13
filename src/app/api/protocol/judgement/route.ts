import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import UserProfile from "@/models/UserProfile";
import dbConnect from "@/lib/db";
import { z } from "zod";

const JudgementSchema = z.object({
  reason: z.string().min(3, "Please state the reason for this transgression").max(500),
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
    const { reason } = JudgementSchema.parse(body);

    const result = await ProtocolService.executeSystemJudgement(
      session.userId,
      timezone,
      reason
    );

    return successResponse(
      result,
      `System Judgement Executed. ${result.purgedXP} XP has been purged and habit streaks broken.`
    );
  } catch (error) {
    return handleApiError(error);
  }
}

