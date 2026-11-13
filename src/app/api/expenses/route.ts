import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import UserProfile from "@/models/UserProfile";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const CreateExpenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.enum(["FOOD", "TRAVELLING", "ENTERTAINMENT", "OUTING", "MISCELLANEOUS"]),
  description: z.string().min(1, "Description is required").max(250),
  targetDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    await dbConnect();
    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";

    const { searchParams } = new URL(req.url);
    const targetDate = searchParams.get("targetDate") || ProtocolService.getTodayDateString(timezone);

    const expenses = await Expense.find({
      userId: session.userId,
      targetDate,
    }).sort({ createdAt: -1 });

    const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

    return successResponse({
      expenses,
      totalSpent,
      targetDate,
    }, "Expenses retrieved successfully");
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

    const body = await req.json();
    const validated = CreateExpenseSchema.parse(body);

    const targetDate = validated.targetDate || ProtocolService.getTodayDateString(timezone);

    const expense = await Expense.create({
      userId: session.userId,
      amount: validated.amount,
      category: validated.category,
      description: validated.description,
      targetDate,
    });

    // Refresh protocol financial sphere
    await ProtocolService.getOrCreateTodayProtocol(session.userId, timezone);

    return successResponse(expense, "Expense logged successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

