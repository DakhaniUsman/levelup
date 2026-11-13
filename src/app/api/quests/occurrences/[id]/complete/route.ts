import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { QuestService } from "@/features/quests/services/quest.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { id } = await params;
    const result = await QuestService.completeOccurrence(id, session.userId);

    return successResponse(result, "Quest occurrence completed successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

