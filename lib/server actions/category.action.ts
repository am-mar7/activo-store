"use server";

import {
  ActionResponse,
  CategoryParams,
  CategoryType,
  EditCategoryParams,
  ErrorResponse,
  PaginatedSearchParams,
} from "@/types/global";
import actionHandler from "../handlers/action";
import {
  CategorySchema,
  EditCategorySchema,
  PaginatedSearchParamsSchema,
} from "../validation";
import handleError from "../handlers/error";
import { handleUpload } from "../utils";
import { Category, Product } from "@/models";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "../mongoose";
import { revalidatePath } from "next/cache";
import { DASHBOARDROUTES } from "@/constants/routes";

export async function addCatergory(
  params: CategoryParams
): Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: CategorySchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  if (validated.session?.user.role !== "admin")
    return handleError(new Error("Unauthorized")) as ErrorResponse;

  try {
    const { image, slug, name, parentId } = validated.params!;
    const { data, success, error } = await handleUpload(image);
    console.log(data);

    if (!success || !data?.url)
      throw new Error(error?.message || "Upload failed");

    const category = await Category.create({
      name,
      slug,
      image: data?.url,
      parentId,
    });
    if (!category) throw new Error("Failed to create category");
    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getCategories(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ categories: CategoryType[]; isNext: boolean }>> {
  const validated = await actionHandler({
    params,
    schema: PaginatedSearchParamsSchema,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { page = 1, pageSize, query } = validated.params!;

  const filterQuery: mongoose.QueryFilter<typeof Category> = {
    isActive: true,
    slug: { $ne: "uncategorized" },
  };
  if (query) {
    const sanitized = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filterQuery.name = { $regex: sanitized, $options: "i" };
  }

  try {
    if (!pageSize) {
      const categories = await Category.find(filterQuery)
        .sort({ name: 1 })
        .lean();

      return {
        success: true,
        data: {
          categories: JSON.parse(JSON.stringify(categories)),
          isNext: false,
        },
      };
    }

    const skip = (page - 1) * pageSize;

    const [categories, categoriesCount] = await Promise.all([
      Category.find(filterQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Category.countDocuments(filterQuery),
    ]);

    const isNext = categoriesCount > skip + categories.length;

    return {
      success: true,
      data: {
        categories: JSON.parse(JSON.stringify(categories)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteCategory(id: string): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  try {
    await dbConnect();

    const category = await Category.findByIdAndUpdate(id, { isActive: false });
    if (!category) throw new Error("Category not found");

    let uncategorized = await Category.findOne({ slug: "uncategorized" });
    if (!uncategorized) {
      uncategorized = await Category.create({
        name: "Uncategorized",
        slug: "uncategorized",
        image: "/images/uncategorized.svg",
        isActive: true,
      });
    }

    await Promise.all([
      Product.updateMany(
        { category: { $in: [category._id] } },
        [
          {
            $set: {
              category: {
                $filter: {
                  input: "$category",
                  cond: { $ne: ["$$this", category._id] },
                },
              },
            },
          },
          {
            $set: {
              category: {
                $cond: [
                  { $eq: [{ $size: "$category" }, 0] },
                  [uncategorized!._id],
                  "$category",
                ],
              },
            },
          },
        ],
        { updatePipeline: true } // ✅ Add this option
      ),
      Category.updateMany({ parentId: category._id }, { parentId: undefined }),
    ]);

    revalidatePath(DASHBOARDROUTES.CATEGORYS);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getCategory(
  id: string
): Promise<ActionResponse<CategoryType>> {
  try {
    await dbConnect();
    const category = await Category.findById(id).lean();
    if (!category) throw new Error("Category not found");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(category)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function editCategory(params: EditCategoryParams):Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: EditCategorySchema.partial(),
    authorizetionProccess: true,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  if (validated.session?.user.role !== "admin")
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  const { name, parentId, image, slug, id } = validated.params!;
  try {
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");

    if (image) {
      const { data, success, error } = await handleUpload(image);
      console.log(data);

      if (!success || !data?.url)
        throw new Error(error?.message || "Upload failed");

      category.image = data?.url;
    }
    if (name !== category.name) category.name = name;
    if (slug !== category.slug) category.slug = slug;
    if (parentId !== category.parentId) category.parentId = parentId;

    await category.save();
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
