import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { QuestService } from "@/features/quests/services/quest.service";
import { UpdateQuestSchema } from "@/features/quests/schemas/quest.schema";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { id } = await params;
    const json = await req.json();
    const validatedData = UpdateQuestSchema.parse(json);

    const updatedQuest = await QuestService.updateQuest(
      id,
      session.userId,
      validatedData
    );

    if (!updatedQuest) {
      return errorResponse("Quest not found or access denied", "NOT_FOUND", 404);
    }

    return successResponse(updatedQuest, "Quest updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { id } = await params;
    const deleted = await QuestService.deleteQuest(id, session.userId);

    if (!deleted) {
      return errorResponse("Quest not found or access denied", "NOT_FOUND", 404);
    }

    return successResponse(
      { deleted: true },
      "Quest removed safely. Historical completion records remain preserved."
    );
  } catch (error) {
    return handleApiError(error);
  }
}

