import { successResponse, handleApiError } from "@/lib/api-response";
import { AuthService } from "@/features/auth/services/auth.service";

export async function POST() {
  try {
    await AuthService.logout();
    return successResponse({ loggedOut: true }, "Session terminated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

