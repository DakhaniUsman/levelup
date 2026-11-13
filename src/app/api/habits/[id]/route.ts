import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { HabitService } from "@/features/habits/services/habit.service";
import { UpdateHabitSchema } from "@/features/habits/schemas/habit.schema";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

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
    const json = await req.json();
    const validatedData = UpdateHabitSchema.parse(json);

    const habit = await HabitService.updateHabit(id, session.userId, validatedData);
    return successResponse(habit, "Habit directive updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { id } = await params;
    const deleted = await HabitService.deleteHabit(id, session.userId);

    if (!deleted) {
      return errorResponse("Habit not found or already deleted", "NOT_FOUND", 404);
    }

    return successResponse({ deleted: true }, "Habit deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

