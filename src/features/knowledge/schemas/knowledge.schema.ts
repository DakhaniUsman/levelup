import { z } from "zod";

export const CreateBookmarkSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),
  url: z.string().url("Must be a valid URL"),
  description: z.string().max(1000).optional().default(""),
  notes: z.string().optional().default(""),
  category: z.enum([
    "PROGRAMMING",
    "TECHNOLOGY",
    "BUSINESS",
    "FINANCE",
    "PERSONAL_DEV",
    "BOOKS",
    "TUTORIALS",
    "RESEARCH",
  ]),
  tags: z.array(z.string()).optional().default([]),
  isFavorite: z.boolean().optional().default(false),
});

export const UpdateBookmarkSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  url: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  notes: z.string().optional(),
  category: z
    .enum([
      "PROGRAMMING",
      "TECHNOLOGY",
      "BUSINESS",
      "FINANCE",
      "PERSONAL_DEV",
      "BOOKS",
      "TUTORIALS",
      "RESEARCH",
    ])
    .optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export type CreateBookmarkInput = z.infer<typeof CreateBookmarkSchema>;
export type UpdateBookmarkInput = z.infer<typeof UpdateBookmarkSchema>;

