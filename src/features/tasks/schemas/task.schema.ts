import { z } from "zod";

export const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(150, "Title cannot exceed 150 characters"),
  description: z.string().max(1000).optional(),
  category: z.enum([
    "PERSONAL",
    "CAREER",
    "FITNESS",
    "LEARNING",
    "SPIRITUAL",
    "FINANCE",
    "BUSINESS",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().min(1).max(1440).optional().default(30),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1, "Subtask title is required"),
        isCompleted: z.boolean().default(false),
      })
    )
    .optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(1000).optional(),
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
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  dueDate: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().min(1).max(1440).optional(),
  isArchived: z.boolean().optional(),
  subtasks: z
    .array(
      z.object({
        _id: z.string().optional(),
        title: z.string().min(1),
        isCompleted: z.boolean(),
      })
    )
    .optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

