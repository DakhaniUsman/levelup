import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { FinancialAnalyticsService } from "@/features/finance/services/financial-analytics.service";
import { ProtocolService } from "@/features/protocol/services/protocol.service";
import UserProfile from "@/models/UserProfile";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

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

    const overview = await FinancialAnalyticsService.getMonthlyOverview(
      session.userId,
      month
    );

    return successResponse(overview, `Financial overview for ${month} retrieved`);
  } catch (error) {
    return handleApiError(error);
  }
}
