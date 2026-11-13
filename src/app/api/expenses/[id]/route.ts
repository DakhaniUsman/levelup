import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import UserProfile from "@/models/UserProfile";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { id } = await params;
    await dbConnect();

    const expense = await Expense.findOneAndDelete({
      _id: id,
      userId: session.userId,
    });

    if (!expense) {
      return errorResponse("Expense record not found", "NOT_FOUND", 404);
    }

    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    // Recalculate protocol totals
    await ProtocolService.getOrCreateTodayProtocol(session.userId, timezone);

    return successResponse({ deletedId: id }, "Expense deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

