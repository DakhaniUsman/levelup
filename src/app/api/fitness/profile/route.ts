import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { BodyWeightService } from "@/features/fitness/services/body-weight.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

const UpdateFitnessProfileSchema = z.object({
  startingWeightKg: z.number().min(20).max(300).optional(),
  targetWeightKg: z.number().min(20).max(300).optional(),
  weeklyPplGoal: z.number().min(1).max(7).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const validated = UpdateFitnessProfileSchema.parse(body);

    const updated = await BodyWeightService.updateFitnessProfile(session.userId, validated);
    return successResponse(updated, "Fitness profile updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
