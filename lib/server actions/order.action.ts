"use server";

import { ActionResponse, ErrorResponse, upsertOrderParams } from "@/types/global";
import actionHandler from "../handlers/action";
import { upsertOrderSchema } from "../validation";
import handleError from "../handlers/error";
import { Cart, Order } from "@/models";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import mongoose, { Types } from "mongoose";

export async function PlaceOrder(params: upsertOrderParams):Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: upsertOrderSchema,
    authorizetionProccess: true,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const userId = validated.session?.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [order] = await Order.create(
      [
        {
          userId: new Types.ObjectId(userId),
          ...validated.params,
          orderItems: validated.params!.orderItems.map((item) => ({
            ...item,
            product: new Types.ObjectId(item.product),
          })),
        },
      ],
      { session }
    );
    if (!order) throw new Error("Failed to place order");

    await Cart.findOneAndUpdate({ userId }, { cartItems: [] }, { session });

    await session.commitTransaction();
    revalidatePath(ROUTES.CART);
    params.orderItems.forEach((item) =>
      revalidatePath(ROUTES.PRODUCT(item.product))
    );

    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
