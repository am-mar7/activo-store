import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["user", "admin"]).default("user"),
  email: z.string().email("Invalid email address"),
  image: z.string().url("Invalid image URL").optional(),
});

export const AccountSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, "Name is required"),
  image: z.string().url("Invalid image URL").optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    })
    .optional(),
  provider: z.enum(["credentials", "google"]),
  providerAccountId: z.string().min(1, "Provider account ID is required"),
});
