import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { BodyWeightService } from "@/features/fitness/services/body-weight.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

const UpdateWeightSchema = z.object({
  weightKg: z.number().min(20).max(300).optional(),
  date: z.string().optional(),
  notes: z.string().max(200).optional(),
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
    const validated = UpdateWeightSchema.parse(body);

    const updated = await BodyWeightService.updateWeight(id, session.userId, validated);
    if (!updated) {
      return errorResponse("Weight entry not found", "NOT_FOUND", 404);
    }

    return successResponse(updated, "Weight entry updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { id } = await params;
    const success = await BodyWeightService.deleteWeight(id, session.userId);
    if (!success) {
      return errorResponse("Weight entry not found", "NOT_FOUND", 404);
    }

    return successResponse({ deleted: true }, "Weight entry deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
