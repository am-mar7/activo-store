"use server";

import { ActionResponse, CategoryParams, ErrorResponse } from "@/types/global";
import actionHandler from "../handlers/action";
import { CategorySchema } from "../validation";
import handleError from "../handlers/error";
import { handleUpload } from "../utils";
import { Category } from "@/models";

export async function addCatergory(
  params: CategoryParams
): Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: CategorySchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error) {
    return handleError(validated) as ErrorResponse;
  }
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
