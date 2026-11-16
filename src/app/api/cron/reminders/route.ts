import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { AccountabilityService } from "@/features/notifications/services/accountability.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecretHeader = req.headers.get("x-cron-secret");
    const configuredSecret = process.env.CRON_SECRET;

    const isCronAuthorized =
      configuredSecret &&
      ((authHeader && authHeader === `Bearer ${configuredSecret}`) ||
        cronSecretHeader === configuredSecret);

    // If not authorized by cron secret, check if authenticated session exists
    if (!isCronAuthorized) {
      const session = await getSession();
      if (!session?.userId) {
        return errorResponse("Unauthorized cron execution", "UNAUTHORIZED", 401);
      }
    }

    const report = await AccountabilityService.runGlobalAccountabilityCycle();
    return successResponse(report, "Accountability reminder cycle executed successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

