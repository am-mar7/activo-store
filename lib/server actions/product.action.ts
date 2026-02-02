"use server";

import {
  EditProductSchema,
  PaginatedSearchParamsSchema,
  ProductSchema,
  getCategoriedProductsSchema,
  getProductsByCategoryIdSchema,
} from "./../validation";
import {
  ActionResponse,
  ProductParams,
  ErrorResponse,
  PaginatedSearchParams,
  ProductType,
  EditProductParams,
  getCategoriedProductsParams,
  getProductsByCategoryIdParams,
  PaginatedActionResponse,
  SearchProductResult,
} from "@/types/global";
import actionHandler from "../handlers/action";
import handleError from "../handlers/error";
import { Cart, Category, Product, Wishlist } from "@/models";
import { getCurrentSeason, handleUpload } from "../utils";
import { PipelineStage, QueryFilter } from "mongoose";
import { dbConnect } from "../mongoose";
import { revalidatePath } from "next/cache";
import { DASHBOARDROUTES } from "@/constants/routes";
import { auth } from "@/auth";
import { NotFoundError } from "../http-errors";
import { ICategoryDoc } from "@/models/category.model";

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

export async function getProduct(
  id: string
): Promise<ActionResponse<ProductType>> {
  try {
    await dbConnect();
    const product = await Product.findById(id);
    if (!product) throw new NotFoundError("Product");
    return {
      success: true,
      data: JSON.parse(JSON.stringify(product)),
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

export async function editProduct(
  params: EditProductParams
): Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: EditProductSchema,
    authorizetionProccess: true,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  if (validated.session?.user.role !== "admin")
    return handleError(new Error("Unauthorized")) as ErrorResponse;

  const { id, images, oldImages, ...restData } = validated.params!;
  try {
    const product = await Product.findById(id);
    if (!product) throw new NotFoundError("Product");

    const imageLinks = [...oldImages];
    if (images.length > 0) {
      const uploadResults = await Promise.allSettled(
        images.map((image) => handleUpload(image))
      );

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
    }

    await Product.findByIdAndUpdate(
      id,
      { ...restData, images: imageLinks },
      { new: true }
    );
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getBestSellers(): Promise<ActionResponse<ProductType[]>> {
  const collection = getCurrentSeason();
  try {
    await dbConnect();

    const products = await Product.find({ isActive: true, collection })
      .sort({ sold: -1 }) // Sort by most sold (descending)
      .limit(10)
      .lean();
      
    if (!products) throw new Error("Failed to get products");
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getCategoriedProducts(
  params: getCategoriedProductsParams
): Promise<PaginatedActionResponse<ProductType>> {
  const validated = await actionHandler({
    params,
    schema: getCategoriedProductsSchema,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { slug, page = 1, pageSize = 10 } = validated.params!;
  const skip = (page - 1) * pageSize;
  try {
    const category = (await Category.findOne({
      slug,
      isActive: true,
    }).lean()) as ICategoryDoc;
    if (!category) throw new NotFoundError("Category");

    const [products, count] = await Promise.all([
      Product.find({ isActive: true, category: category._id })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Product.countDocuments({ isActive: true, category: category._id }),
    ]);

    const isNext = count > products.length + skip;

    return {
      success: true,
      data: {
        items: JSON.parse(JSON.stringify(products)),
        isNext,
        total: count,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getProductsByCollections(
  params: getCategoriedProductsParams
): Promise<PaginatedActionResponse<ProductType>> {
  const validated = await actionHandler({
    params,
    schema: getCategoriedProductsSchema,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { slug, page = 1, pageSize = 10 } = validated.params!;
  const skip = (page - 1) * pageSize;

  try {
    let collectionFilter: QueryFilter<typeof Product>;

    if (slug === "all") {
      collectionFilter = {
        collection: { $in: ["winter", "summer", "both"] },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    } else if (slug === "summer") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collectionFilter = { collection: { $in: ["summer", "both"] } } as any;
    } else if (slug === "winter") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collectionFilter = { collection: { $in: ["winter", "both"] } } as any;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collectionFilter = { collection: slug } as any;
    }

    const filter: QueryFilter<typeof Product> = {
      isActive: true,
      ...collectionFilter,
    };

    const [products, count] = await Promise.all([
      Product.find(filter).skip(skip).limit(pageSize).lean(),
      Product.countDocuments(filter),
    ]);

    const isNext = skip + products.length < count;

    return {
      success: true,
      data: {
        items: JSON.parse(JSON.stringify(products)),
        isNext,
        total: count,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getProductsByCategoryId(
  params: getProductsByCategoryIdParams
): Promise<ActionResponse<{ products: ProductType[]; isNext: boolean }>> {
  const validated = await actionHandler({
    params,
    schema: getProductsByCategoryIdSchema,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { id, page = 1, pageSize = 50 } = validated.params!;
  const skip = (page - 1) * pageSize;
  try {
    const [products, count] = await Promise.all([
      Product.find({ isActive: true, category: id })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Product.countDocuments({ isActive: true, category: id }),
    ]);

    const isNext = count > products.length + skip;

    return {
      success: true,
      data: { products: JSON.parse(JSON.stringify(products)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function GlobalSearch(
  query: string
): Promise<ActionResponse<SearchProductResult[]>> {
  try {
    await dbConnect();
    const pipeline: PipelineStage[] = [
      {
        $match: {
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $match: {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { "categoryDetails.name": { $regex: query, $options: "i" } },
          ],
        },
      },
      {
        $sort: {
          sold: -1,
          createdAt: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          newPrice: 1,
          oldPrice: 1,
          images: 1,
          variants: 1,
          collection: 1,
          averageRating: 1,
          totalReviews: 1,
          sold: 1,
          categoryDetails: {
            _id: 1,
            name: 1,
            slug: 1,
          },
        },
      },
    ];

    const results = await Product.aggregate(pipeline);

    return { success: true, data: JSON.parse(JSON.stringify(results)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
