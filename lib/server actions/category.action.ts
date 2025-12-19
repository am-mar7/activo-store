"use server";

import {
  ActionResponse,
  CategoryParams,
  CategoryType,
  ErrorResponse,
  PaginatedSearchParams,
} from "@/types/global";
import actionHandler from "../handlers/action";
import { CategorySchema, PaginatedSearchParamsSchema } from "../validation";
import handleError from "../handlers/error";
import { handleUpload } from "../utils";
import { Category } from "@/models";
import mongoose from "mongoose";

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
  
  const filterQuery: mongoose.QueryFilter<typeof Category> = { isActive: true };
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
