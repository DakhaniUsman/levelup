import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { AuthService } from "@/features/auth/services/auth.service";

export async function GET() {
  try {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      return errorResponse("Unauthenticated hunter session", "UNAUTHORIZED", 401);
    }
    return successResponse(user, "Hunter session verified");
  } catch (error) {
    return handleApiError(error);
  }
}

