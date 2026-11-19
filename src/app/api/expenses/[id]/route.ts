import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import UserProfile from "@/models/UserProfile";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const UpdateExpenseSchema = z.object({
  amount: z.number().min(0).optional(),
  category: z.string().min(1).max(50).optional(),
  description: z.string().min(1).max(250).optional(),
  targetDate: z.string().optional(),
});

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
    const validated = UpdateExpenseSchema.parse(body);

    await dbConnect();
    const expense = await Expense.findOne({ _id: id, userId: session.userId });
    if (!expense) {
      return errorResponse("Expense record not found", "NOT_FOUND", 404);
    }

    if (validated.amount !== undefined) expense.amount = validated.amount;
    if (validated.category !== undefined) expense.category = validated.category;
    if (validated.description !== undefined) expense.description = validated.description;
    if (validated.targetDate !== undefined) expense.targetDate = validated.targetDate;

    await expense.save();

    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    // Recalculate protocol totals and sync across modules
    await ProtocolService.syncExpenseAudit(session.userId, timezone);

    return successResponse(expense, "Expense updated and synchronized successfully");
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

    // Recalculate protocol totals and sync across modules
    await ProtocolService.syncExpenseAudit(session.userId, timezone);

    return successResponse({ deletedId: id }, "Expense deleted and synchronized successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

