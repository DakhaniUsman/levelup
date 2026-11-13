import { z } from "zod";

export const RegisterUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and dashes"
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name cannot exceed 50 characters")
    .optional(),
  timezone: z.string().default("UTC"),
});

export const LoginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

