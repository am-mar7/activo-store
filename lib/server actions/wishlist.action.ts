"use server";

import { ActionResponse, ErrorResponse, ProductType } from "@/types/global";
import handleError from "../handlers/error";
import { Wishlist } from "@/models";
import { dbConnect } from "../mongoose";
import { auth } from "@/auth";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

export async function getWishlist(
  userId: string
): Promise<ActionResponse<{ product: ProductType; userId: string }[]>> {
  try {
    await dbConnect();

    const wishlist = await Wishlist.find({ userId }).populate("product");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(wishlist)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getWishlistIds(
  userId: string
): Promise<ActionResponse<string[]>> {
  try {
    await dbConnect();

    const data = await Wishlist.find({ userId });

    const wishlist = data.map((item) => item.product);
    return {
      success: true,
      data: JSON.parse(JSON.stringify(wishlist)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function addProductToWishlist(
  product: string
): Promise<ActionResponse> {
  const session = await auth();
  const userId = session?.user.id;
  try {
    if (!userId) throw new UnauthorizedError();
    await dbConnect();

    await Wishlist.insertOne({ product, userId });

    revalidatePath("/");
    revalidatePath(ROUTES.WISHLIST);
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteProductFromWishlist(
  product: string
): Promise<ActionResponse> {
  const session = await auth();
  const userId = session?.user.id;
  try {
    if (!userId) throw new UnauthorizedError();
    await dbConnect();

    const deletedProduct = await Wishlist.deleteOne({ product, userId });
    if (!deletedProduct) throw new NotFoundError("Product");

    revalidatePath("/");
    revalidatePath(ROUTES.WISHLIST);
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
