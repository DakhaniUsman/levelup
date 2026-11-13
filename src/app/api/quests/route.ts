import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { QuestService } from "@/features/quests/services/quest.service";
import { CreateQuestSchema } from "@/features/quests/schemas/quest.schema";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import UserProfile from "@/models/UserProfile";
import dbConnect from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const quests = await QuestService.getQuests(session.userId);
    return successResponse(quests, "Quests retrieved successfully");
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

    await dbConnect();
    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    const json = await req.json();
    const validatedData = CreateQuestSchema.parse(json);
    const quest = await QuestService.createQuest(session.userId, validatedData, timezone);

    return successResponse(quest, "Daily quest registered successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

