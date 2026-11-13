import { NextRequest } from "next/server";
import { RegisterUserSchema } from "@/features/auth/schemas/auth.schema";
import { AuthService } from "@/features/auth/services/auth.service";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const validatedData = RegisterUserSchema.parse(json);
    const user = await AuthService.register(validatedData);

    return successResponse(user, "Hunter registered successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

