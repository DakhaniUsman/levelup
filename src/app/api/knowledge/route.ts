import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { KnowledgeService } from "@/features/knowledge/services/knowledge.service";
import { CreateBookmarkSchema } from "@/features/knowledge/schemas/knowledge.schema";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { BookmarkCategory } from "@/models/Bookmark";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as BookmarkCategory | undefined;
    const isFavorite =
      searchParams.get("isFavorite") === "true"
        ? true
        : searchParams.get("isFavorite") === "false"
        ? false
        : undefined;
    const search = searchParams.get("search") || undefined;
    const tag = searchParams.get("tag") || undefined;

    const bookmarks = await KnowledgeService.getBookmarks({
      userId: session.userId,
      category,
      isFavorite,
      search,
      tag,
    });

    return successResponse(bookmarks, "Bookmarks retrieved successfully");
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

    const json = await req.json();
    const validatedData = CreateBookmarkSchema.parse(json);
    const bookmark = await KnowledgeService.createBookmark(
      session.userId,
      validatedData
    );

    return successResponse(bookmark, "Bookmark stored in knowledge archive", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

