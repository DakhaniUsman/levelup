import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { BudgetService } from "@/features/finance/services/budget.service";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import UserProfile from "@/models/UserProfile";
import { CacheService } from "@/lib/cache.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

const IncomeSourceSchema = z.object({
  sourceName: z.string().min(1, "Income source name required").max(50),
  amount: z.number().min(0, "Amount must be positive"),
  isSalary: z.boolean().default(false),
});

const CategoryBudgetSchema = z.object({
  categoryName: z.string().min(1, "Category name required").max(50),
  allocatedAmount: z.number().min(0, "Allocated amount must be positive"),
});

const UpdateBudgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  incomes: z.array(IncomeSourceSchema).optional(),
  categoryBudgets: z.array(CategoryBudgetSchema).optional(),
  savingsTarget: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const profile = await UserProfile.findOne({ userId: session.userId });
    const timezone = profile?.timezone || "UTC";
    const todayStr = ProtocolService.getTodayDateString(timezone);

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || todayStr.slice(0, 7);

    const budget = await BudgetService.getOrCreateBudget(session.userId, month);
    return successResponse(budget, `Monthly budget configuration for ${month} retrieved`);
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

    const body = await req.json();
    const validated = UpdateBudgetSchema.parse(body);

    const budget = await BudgetService.updateBudget(
      session.userId,
      validated.month,
      {
        incomes: validated.incomes,
        categoryBudgets: validated.categoryBudgets,
        savingsTarget: validated.savingsTarget,
        notes: validated.notes,
      }
    );

    // Invalidate finance and dashboard caches
    await CacheService.invalidateFinance(session.userId);

    return successResponse(budget, `Monthly budget for ${validated.month} saved successfully`);
  } catch (error) {
    return handleApiError(error);
  }
}
