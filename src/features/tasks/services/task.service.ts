import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Task, { ITask, TaskCategory, TaskPriority, TaskStatus } from "@/models/Task";
import { CreateTaskInput, UpdateTaskInput } from "../schemas/task.schema";
import { XPService } from "@/features/progression/services/xp.service";

export interface TaskFilterParams {
  userId: string | Types.ObjectId;
  status?: TaskStatus;
  category?: TaskCategory;
  priority?: TaskPriority;
  search?: string;
  isArchived?: boolean;
}

export class TaskService {
  static async createTask(
    userId: string | Types.ObjectId,
    input: CreateTaskInput
  ): Promise<ITask> {
    await dbConnect();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const task = await Task.create({
      userId: userObjId,
      title: input.title.trim(),
      description: input.description?.trim() || "",
      category: input.category,
      priority: input.priority || "MEDIUM",
      status: "TODO",
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      estimatedMinutes: input.estimatedMinutes || 30,
      subtasks: input.subtasks || [],
    });

    return task;
  }

  static async getTasks(params: TaskFilterParams): Promise<ITask[]> {
    await dbConnect();

    const userObjId =
      typeof params.userId === "string"
        ? new Types.ObjectId(params.userId)
        : params.userId;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {
      userId: userObjId,
      isArchived: params.isArchived ?? false,
    };

    if (params.status) filter.status = params.status;
    if (params.category) filter.category = params.category;
    if (params.priority) filter.priority = params.priority;

    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: "i" } },
        { description: { $regex: params.search, $options: "i" } },
      ];
    }

    return Task.find(filter).sort({ dueDate: 1, createdAt: -1 }).lean();
  }

  static async getTaskById(
    taskId: string,
    userId: string | Types.ObjectId
  ): Promise<ITask | null> {
    await dbConnect();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    return Task.findOne({ _id: taskId, userId: userObjId });
  }

  static async updateTask(
    taskId: string,
    userId: string | Types.ObjectId,
    input: UpdateTaskInput
  ): Promise<{ task: ITask; xpEarned?: number }> {
    await dbConnect();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const task = await Task.findOne({ _id: taskId, userId: userObjId });
    if (!task) {
      throw new Error("Task not found or access denied.");
    }

    const wasCompleted = task.status === "COMPLETED";

    if (input.title !== undefined) task.title = input.title.trim();
    if (input.description !== undefined) task.description = input.description.trim();
    if (input.category !== undefined) task.category = input.category;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.estimatedMinutes !== undefined) task.estimatedMinutes = input.estimatedMinutes;
    if (input.isArchived !== undefined) task.isArchived = input.isArchived;
    if (input.subtasks !== undefined) task.subtasks = input.subtasks as ITask["subtasks"];
    if (input.dueDate !== undefined) {
      task.dueDate = input.dueDate ? new Date(input.dueDate) : undefined;
    }

    let xpEarned = 0;

    if (input.status !== undefined) {
      task.status = input.status;

      // Handle completion transition
      if (input.status === "COMPLETED" && !wasCompleted) {
        task.completedAt = new Date();

        // Award XP idempotently via XP Engine
        const xpResult = await XPService.awardXP({
          userId: userObjId,
          amount: task.xpReward,
          sourceType: "TASK",
          sourceId: task._id.toString(),
          description: `Completed task: ${task.title}`,
        });

        if (xpResult.isNewReward) {
          xpEarned = task.xpReward;
        }
      } else if (input.status !== "COMPLETED") {
        task.completedAt = undefined;
      }
    }

    await task.save();

    return { task, xpEarned };
  }

  static async deleteTask(
    taskId: string,
    userId: string | Types.ObjectId
  ): Promise<boolean> {
    await dbConnect();

    const userObjId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const res = await Task.deleteOne({ _id: taskId, userId: userObjId });
    return res.deletedCount > 0;
  }
}
