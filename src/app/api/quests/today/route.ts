import { getSession } from "@/lib/session";
import { QuestService } from "@/features/quests/services/quest.service";
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

    const occurrences = await QuestService.getTodayOccurrences(session.userId, timezone);
    return successResponse(occurrences, "Today's quest occurrences retrieved");
  } catch (error) {
    return handleApiError(error);
  }
}

