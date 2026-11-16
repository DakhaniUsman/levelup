import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { ProtocolItemService } from "@/features/protocol/services/protocol-item.service";
import { UpdateProtocolItemSchema } from "@/features/protocol/schemas/protocol-item.schema";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

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
    const body = await req.json();
    const validated = UpdateProtocolItemSchema.parse(body);

    const updated = await ProtocolItemService.updateItem(
      session.userId,
      id,
      validated
    );

    if (!updated) {
      return errorResponse("Protocol item not found or unauthorized", "NOT_FOUND", 404);
    }

    return successResponse(updated, "Protocol activity updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { id } = await params;
    const success = await ProtocolItemService.deleteItem(session.userId, id);

    if (!success) {
      return errorResponse("Protocol item not found or unauthorized", "NOT_FOUND", 404);
    }

    return successResponse({ deletedId: id }, "Protocol activity deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

