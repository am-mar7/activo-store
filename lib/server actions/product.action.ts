"use server";

import { PaginatedSearchParamsSchema, ProductSchema } from "./../validation";
import {
  ActionResponse,
  ProductParams,
  ErrorResponse,
  PaginatedSearchParams,
  ProductType,
} from "@/types/global";
import actionHandler from "../handlers/action";
import handleError from "../handlers/error";
import { Cart, Category, Product, Wishlist } from "@/models";
import { handleUpload } from "../utils";
import { QueryFilter } from "mongoose";
import { dbConnect } from "../mongoose";
import { revalidatePath } from "next/cache";
import { DASHBOARDROUTES } from "@/constants/routes";
import { auth } from "@/auth";
import { NotFoundError } from "../http-errors";

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

export async function getProducts(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ products: ProductType[]; isNext: boolean }>> {
  const validated = await actionHandler({
    params,
    schema: PaginatedSearchParamsSchema,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { page = 1, pageSize = 10, query, filter } = validated.params!;
  const filterQuery: QueryFilter<typeof Product> = {
    isActive: true,
  };
  if (query) {
    const sanitized = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filterQuery.title = { $regex: sanitized, $options: "i" };
  }

  const skip = (page - 1) * pageSize;
  try {
    if (filter) {
      const category = await Category.findOne({
        slug: filter,
        isActive: true,
      }).lean();

      if (category) {
        filterQuery.category = { $in: [category._id] };
      }
    }

    const [products, count] = await Promise.all([
      Product.find(filterQuery).skip(skip).limit(pageSize).lean(),
      Product.countDocuments(filterQuery),
    ]);

    const isNext = skip + products.length < count;
    if (!products) throw new Error("Failed to get products");

    return {
      success: true,
      data: { products: JSON.parse(JSON.stringify(products)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteProduct(id: string): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return handleError(new Error("Unauthorized")) as ErrorResponse;
  }

  try {
    await dbConnect();

    const product = await Product.findByIdAndUpdate(id, { isActive: false });
    if (!product) throw new NotFoundError("Product");

    await Promise.all([
      Wishlist.deleteMany({ product: id }),
      Cart.updateMany(
        { "cartItems.product": id },
        { $pull: { cartItems: { product: id } } }
      ),
    ]);

    revalidatePath(DASHBOARDROUTES.PRODUCTS);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
