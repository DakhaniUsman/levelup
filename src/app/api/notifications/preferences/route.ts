import { NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { AccountabilityService } from "@/features/notifications/services/accountability.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

const updatePreferencesSchema = z.object({
  enabled: z.boolean().optional(),
  categories: z
    .object({
      protocol: z.boolean().optional(),
      habits: z.boolean().optional(),
      quests: z.boolean().optional(),
      progression: z.boolean().optional(),
      workouts: z.boolean().optional(),
      expenses: z.boolean().optional(),
      dailyReport: z.boolean().optional(),
    })
    .optional(),
  reminderTimes: z
    .object({
      morning: z.string().optional(),
      afternoon: z.string().optional(),
      evening: z.string().optional(),
      night: z.string().optional(),
      dailyReport: z.string().optional(),
    })
    .optional(),
  quietHours: z
    .object({
      enabled: z.boolean().optional(),
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
  maxRemindersPerDay: z.number().min(1).max(20).optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const preferences = await AccountabilityService.getUserPreferences(session.userId);
    return successResponse(preferences, "Notification preferences retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return errorResponse("Unauthenticated session", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const validated = updatePreferencesSchema.parse(body);

    const updated = await AccountabilityService.updateUserPreferences(session.userId, validated as any);
    return successResponse(updated, "Notification preferences updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

