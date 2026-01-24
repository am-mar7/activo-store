import { z } from "zod";

export const PaginatedSearchParamsSchema = z.object({
  page: z.number().int().default(1),
  pageSize: z.number().int().default(10),
  query: z.string().optional(),
  filter: z.string().optional(),
  sort: z.string().optional(),
});

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
    collection: z.enum(["winter", "summer", "both"]),
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

export const EditProductSchema = ProductSchema.safeExtend({
  id: z.string().min(1, "ID is required"),
  oldImages: z.array(z.string().url("Invalid image URL")),
  images: z.array(
    z.instanceof(File).refine((file) => file.type.startsWith("image/"), {
      message: "File must be an image",
    })
  ),
});

export const CategorySchema = z.object({
  parentId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  image: z.instanceof(File).refine((file) => file.type.startsWith("image/"), {
    message: "File must be an image",
  }),
  slug: z.string().min(1, "Slug is required"),
  isActive: z.boolean().default(true),
});

export const EditCategorySchema = CategorySchema.extend({
  id: z.string().min(1, "ID is required"),
  image: z
    .instanceof(File)
    .refine((file) => file.type.startsWith("image/"), {
      message: "File must be an image",
    })
    .optional(),
});

export const getCategoriedProductsSchema = PaginatedSearchParamsSchema.extend({
  slug: z.string().min(1, "category slug is required"),
});

export const getProductsByCategoryIdSchema = PaginatedSearchParamsSchema.extend(
  {
    id: z.string().min(1, "category id is required"),
  }
);

export const UpsertCartItemSchema = z.object({
  product: z.string().min(1, "product id is required"),
  sku: z.string().min(1, "sku is required"),
  quantity: z.int().min(1, "quantity can't be less than 1"),
  type: z.enum(["add", "update"]),
});

export const removeFromCartSchema = z.object({
  product: z.string().min(1, "product id is required"),
  sku: z.string().min(1, "sku is required"),
});

const orderItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
  variantSku: z.string().min(1, "Variant SKU is required"),
  variantColor: z.string().optional(),
  variantSize: z.string().optional(),
  productTitle: z.string().min(1, "Product title is required"),
  productImage: z.string().min(1, "Product image is required"),
  priceAtPurchase: z.number().nonnegative("Price must be positive"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  subTotal: z.number().nonnegative().optional(),
});

export const getUserOrdersSchema = PaginatedSearchParamsSchema.extend({
  userId: z.string().min(1, "user id is required"),
});

const paymentSchema = z.object({
  method: z.enum(["visa", "COD"]),
  status: z.enum(["pending", "completed", "failed", "refunded"]),
  transactionId: z.string().optional(),
  gatewayResponse: z.record(z.string(), z.any()).optional(),
});

export const upsertOrderSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1, "At least one item required"),
  totalPrice: z.number().nonnegative(),
  shippingAddress: z.object({
    city: z.string().min(1, "City is required"),
    phone: z.string().min(10, "Valid phone number required"),
    details: z.string().min(5, "Detailed address is required"),
  }),
  payment: paymentSchema,
  status: z
    .enum(["pending", "delivering", "cancelled", "delivered"])
    .optional(),
  shippingCost: z.number().nonnegative(),
  promoCode: z
    .object({
      code: z.string(),
      discount: z.number().min(0).max(100),
      discountAmount: z.number().nonnegative(),
    })
    .optional(),
});

export const addressFormSchema = z.object({
  city: z.string().min(1, "City is required"),
  phone: z
    .string()
    .regex(/^(\+20|0)?1[0125]\d{8}$/, "Invalid Egyptian phone number"),
  details: z.string().min(10, "Please provide detailed address information"),
});

export const addAddressSchema = addressFormSchema.extend({
  isDefault: z.boolean().optional(),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  status: z.enum(["pending", "delivering", "cancelled", "delivered"]),
});

export const changeUserRoleSchema = z.object({
  userId: z.string().min(1, "user id is required"),
  role: z.enum(["user", "admin"]),
});

export const PromoCodeSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be at most 20 characters")
    .toUpperCase(),
  percentage: z
    .number()
    .min(0, "Percentage must be at least 0")
    .max(100, "Percentage cannot exceed 100"),
  maxDiscount: z.number().min(0, "Max discount must be at least 0"),
  minPurchase: z.number().min(0, "Min purchase must be at least 0"),
  usageLimit: z.number().min(0, "Usage limit must be at least 0").optional(),
  expiredAt: z.date().optional(),
});

export const editPromoCodeSchema = PromoCodeSchema.extend({
  id: z.string().min(1, "ID is required"),
});
