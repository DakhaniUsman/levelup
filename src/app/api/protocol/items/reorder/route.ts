import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { ProtocolItemService } from "@/features/protocol/services/protocol-item.service";
import { ReorderProtocolItemsSchema } from "@/features/protocol/schemas/protocol-item.schema";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const validated = ReorderProtocolItemsSchema.parse(body);

    await ProtocolItemService.reorderItems(session.userId, validated.items);

    return successResponse(null, "Activities reordered successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

