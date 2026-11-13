import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { XPService } from "@/features/progression/services/xp.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const data = await XPService.getHistory(session.userId, page, limit);
    return successResponse(data, "XP transaction history retrieved");
  } catch (error) {
    return handleApiError(error);
  }
}

