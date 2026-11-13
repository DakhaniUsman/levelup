import { NextRequest } from "next/server";
import { LoginSchema } from "@/features/auth/schemas/auth.schema";
import { AuthService } from "@/features/auth/services/auth.service";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const validatedData = LoginSchema.parse(json);
    const user = await AuthService.login(validatedData);

    return successResponse(user, "Authenticated successfully", 200);
  } catch (error) {
    return handleApiError(error);
  }
}

