import { z } from "zod";

export const CreateQuestSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(150, "Title cannot exceed 150 characters"),
  description: z.string().max(1000).optional().default(""),
  category: z.enum([
    "PERSONAL",
    "CAREER",
    "FITNESS",
    "LEARNING",
    "SPIRITUAL",
    "FINANCE",
    "BUSINESS",
  ]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EPIC"]).default("EASY"),
  frequency: z.enum(["DAILY", "WEEKDAYS", "WEEKLY", "CUSTOM"]).default("DAILY"),
});

export type CreateQuestInput = z.infer<typeof CreateQuestSchema>;

