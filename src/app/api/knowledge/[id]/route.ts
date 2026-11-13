import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { KnowledgeService } from "@/features/knowledge/services/knowledge.service";
import { UpdateBookmarkSchema } from "@/features/knowledge/schemas/knowledge.schema";
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
    const json = await req.json();
    const validatedData = UpdateBookmarkSchema.parse(json);

    const bookmark = await KnowledgeService.updateBookmark(
      id,
      session.userId,
      validatedData
    );

    return successResponse(bookmark, "Bookmark updated successfully");
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
    const deleted = await KnowledgeService.deleteBookmark(id, session.userId);

    if (!deleted) {
      return errorResponse("Bookmark not found or already deleted", "NOT_FOUND", 404);
    }

    return successResponse({ deleted: true }, "Bookmark deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

