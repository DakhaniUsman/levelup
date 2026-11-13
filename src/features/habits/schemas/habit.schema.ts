import { z } from "zod";

export const CreateHabitSchema = z.object({
  title: z
    .string()
    .min(1, "Habit title is required")
    .max(150, "Title cannot exceed 150 characters"),
  description: z.string().max(500).optional().default(""),
  category: z.enum([
    "PERSONAL",
    "CAREER",
    "FITNESS",
    "LEARNING",
    "SPIRITUAL",
    "FINANCE",
    "BUSINESS",
  ]),
  frequency: z.enum(["DAILY", "WEEKDAYS", "WEEKENDS", "CUSTOM"]).default("DAILY"),
  customDays: z.array(z.number().min(0).max(6)).optional().default([0, 1, 2, 3, 4, 5, 6]),
  targetPerDay: z.number().int().min(1).max(10).optional().default(1),
  xpReward: z.number().int().min(5).max(100).optional().default(20),
});

export const UpdateHabitSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(500).optional(),
  category: z
    .enum([
      "PERSONAL",
      "CAREER",
      "FITNESS",
      "LEARNING",
      "SPIRITUAL",
      "FINANCE",
      "BUSINESS",
    ])
    .optional(),
  frequency: z.enum(["DAILY", "WEEKDAYS", "WEEKENDS", "CUSTOM"]).optional(),
  customDays: z.array(z.number().min(0).max(6)).optional(),
  targetPerDay: z.number().int().min(1).max(10).optional(),
  isPaused: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export type CreateHabitInput = z.infer<typeof CreateHabitSchema>;
export type UpdateHabitInput = z.infer<typeof UpdateHabitSchema>;

