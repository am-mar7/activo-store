"use server";

import { ProductSchema } from "./../validation";
import { ActionResponse, ProductParams, ErrorResponse } from "@/types/global";
import actionHandler from "../handlers/action";
import handleError from "../handlers/error";
import { Product } from "@/models";
import { handleUpload } from "../utils";

export async function addProduct(
  params: ProductParams
): Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: ProductSchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error) {
    return handleError(validated) as ErrorResponse;
  }

  try {
    const { images, ...productData } = validated.params!;

    const uploadResults = await Promise.allSettled(
      images.map((image) => handleUpload(image))
    );
    console.log("UPLOAD RESULTS", uploadResults);

    const imageLinks: string[] = [];
    const failedUploads: number[] = [];

    uploadResults.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value.success) {
        imageLinks.push(result.value.data!.url);
      } else {
        failedUploads.push(index);
        console.error(
          `Image ${index} upload failed:`,
          result.status === "rejected" ? result.reason : result.value.error
        );
      }
    });

    if (imageLinks.length === 0) {
      throw new Error("All image uploads failed. Please try again.");
    }
    if (failedUploads.length > 0) {
      console.warn(`${failedUploads.length} image(s) failed to upload`);
    }
    console.log("params", productData);

    const product = await Product.create({
      ...validated.params!,
      images: imageLinks,
    });

    if (!product) throw new Error("Product creation failed");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(product)),
      message:
        failedUploads.length > 0
          ? `Product created but ${failedUploads.length} image(s) failed to upload`
          : undefined,
    } as ActionResponse;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;

    // Handle duplicate SKU error
    if (err.code === 11000 && err.keyPattern?.["variants.sku"]) {
      return handleError(
        new Error("SKU already exists. Please use a unique SKU.")
      ) as ErrorResponse;
    }

    return handleError(error as Error) as ErrorResponse;
  }
}
