"use server";

import handleError from "../handlers/error";
import {
  ActionResponse,
  UpsertCartItemParams,
  ErrorResponse,
} from "@/types/global";
import { dbConnect } from "../mongoose";
import { Cart } from "@/models";
import { UpsertCartItemSchema } from "../validation";
import actionHandler from "../handlers/action";
import { UnauthorizedError } from "../http-errors";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

export async function getCartState(userId: string) {
  try {
    await dbConnect();

    const cart = await Cart.findOne({ userId }).lean();

    if (!cart) {
      return {
        success: true,
        data: { cartItems: [] },
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedItems = cart.cartItems.map((item: any) => ({
      product: item.product._id.toString(),
      variantSku: item.variantSku,
      quantity: item.quantity,
    }));

    return {
      success: true,
      data: {
        cartItems: transformedItems,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function upsertCartItem(
  params: UpsertCartItemParams
): Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: UpsertCartItemSchema,
    authorizetionProccess: true,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { sku, product, quantity, type } = validated.params!;
  const userId = validated.session?.user.id;

  try {
    if (!userId) throw new UnauthorizedError();

    const newCartItem = { product, quantity, variantSku: sku };

    const updateOperation =
      type === "add"
        ? { $inc: { "cartItems.$.quantity": quantity } }
        : { $set: { "cartItems.$.quantity": quantity } };

    let cart = await Cart.findOneAndUpdate(
      {
        userId,
        "cartItems.product": product,
        "cartItems.variantSku": sku,
      },
      updateOperation,
      { new: true }
    );

    if (!cart) {
      cart = await Cart.findOneAndUpdate(
        { userId },
        {
          $setOnInsert: { userId },
          $push: { cartItems: newCartItem },
        },
        { upsert: true, new: true }
      );
    }

    if (!cart) throw new Error("Failed to create cart");

    revalidatePath(ROUTES.CART);
    revalidatePath(ROUTES.PRODUCT(product));
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
