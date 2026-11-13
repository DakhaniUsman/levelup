import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { TaskService } from "@/features/tasks/services/task.service";
import { CreateTaskSchema } from "@/features/tasks/schemas/task.schema";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { TaskCategory, TaskPriority, TaskStatus } from "@/models/Task";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as TaskStatus | undefined;
    const category = searchParams.get("category") as TaskCategory | undefined;
    const priority = searchParams.get("priority") as TaskPriority | undefined;
    const search = searchParams.get("search") || undefined;
    const isArchived = searchParams.get("isArchived") === "true";

    const tasks = await TaskService.getTasks({
      userId: session.userId,
      status,
      category,
      priority,
      search,
      isArchived,
    });

    return successResponse(tasks, "Tasks retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const json = await req.json();
    const validatedData = CreateTaskSchema.parse(json);
    const task = await TaskService.createTask(session.userId, validatedData);

    return successResponse(task, "Task created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

