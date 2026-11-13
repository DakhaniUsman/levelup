import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { TaskService } from "@/features/tasks/services/task.service";
import { UpdateTaskSchema } from "@/features/tasks/schemas/task.schema";
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
    const validatedData = UpdateTaskSchema.parse(json);

    const result = await TaskService.updateTask(id, session.userId, validatedData);
    return successResponse(result, "Task updated successfully");
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
    const deleted = await TaskService.deleteTask(id, session.userId);

    if (!deleted) {
      return errorResponse("Task not found or already deleted", "NOT_FOUND", 404);
    }

    return successResponse({ deleted: true }, "Task deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

