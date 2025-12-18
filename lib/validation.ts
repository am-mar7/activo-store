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

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please provide a valid email address." }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." }),
});

export const SignUpSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Name can only contain letters and spaces.",
    }),

  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please provide a valid email address." }),

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
    }),
});

export const SignInWithOAuthSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  providerAccountId: z.string().min(1, "Provider account ID is required"),
  user: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    image: z.string().url("Invalid image URL").optional(),
  }),
});

export const ProductSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    category: z
      .array(z.string().min(1, "Category ID is required"))
      .min(1, "At least one category is required"),
    oldPrice: z.number().min(0, "price can't be negitave").optional(),
    newPrice: z.number().min(0, "price can't be negitave"),
    variants: z
      .array(
        z.object({
          sku: z.string().min(1, "SKU is required"),
          color: z.string().optional(),
          size: z.string().optional(),
          stock: z.number().min(0, "Stock can't be negative"),
          image: z.string().url("Invalid image URL").optional(),
        })
      )
      .min(1, "At least one variant is required"),
    collection: z.enum(["winter", "summer"]),
    images: z
      .array(
        z.instanceof(File).refine((file) => file.type.startsWith("image/"), {
          message: "File must be an image",
        })
      )
      .min(1, "At least one image is required"),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // If oldPrice exists, it must be greater than newPrice
      if (data.oldPrice !== undefined) {
        return data.oldPrice > data.newPrice;
      }
      return true;
    },
    {
      message: "Compare at price must be greater than the selling price", // old price must be higher
      path: ["oldPrice"],
    }
  );
