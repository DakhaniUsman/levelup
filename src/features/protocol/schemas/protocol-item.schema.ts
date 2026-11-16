import { z } from "zod";

export const ProtocolSphereSchema = z.enum([
  "SPIRITUALITY",
  "MENTAL",
  "PHYSICAL",
  "EMOTIONAL",
  "FINANCIAL",
]);

export const ProtocolItemTypeSchema = z.enum([
  "CHECKBOX",
  "PRAYER_TRACKER",
  "WORKOUT_LOG",
  "FINANCIAL_AUDIT",
]);

export const CreateProtocolItemSchema = z.object({
  sphere: ProtocolSphereSchema,
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title cannot exceed 120 characters"),
  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters")
    .optional()
    .default(""),
  type: ProtocolItemTypeSchema.optional().default("CHECKBOX"),
  order: z.number().int().optional(),
  isActive: z.boolean().optional().default(true),
});

export const UpdateProtocolItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title cannot exceed 120 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters")
    .optional(),
  sphere: ProtocolSphereSchema.optional(),
  type: ProtocolItemTypeSchema.optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const ReorderProtocolItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int(),
    })
  ).min(1, "At least one item is required to reorder"),
});

export const ToggleProtocolActivitySchema = z.object({
  itemId: z.string().min(1),
  isCompleted: z.boolean().optional(),
  subKey: z.enum(["fajr", "dhuhr", "asr", "maghrib", "isha"]).optional(),
  subValue: z.boolean().optional(),
});

export type CreateProtocolItemInput = z.infer<typeof CreateProtocolItemSchema>;
export type UpdateProtocolItemInput = z.infer<typeof UpdateProtocolItemSchema>;
export type ReorderProtocolItemsInput = z.infer<typeof ReorderProtocolItemsSchema>;
export type ToggleProtocolActivityInput = z.infer<typeof ToggleProtocolActivitySchema>;

