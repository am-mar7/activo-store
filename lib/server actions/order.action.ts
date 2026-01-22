"use server";

import {
  ActionResponse,
  ErrorResponse,
  OrderDetailedType,
  OrderType,
  PaginatedActionResponse,
  PaginatedSearchParams,
  updateOrderStatusParams,
  upsertOrderParams,
} from "@/types/global";
import actionHandler from "../handlers/action";
import {
  PaginatedSearchParamsSchema,
  updateOrderStatusSchema,
  upsertOrderSchema,
} from "../validation";
import handleError from "../handlers/error";
import { Cart, Order } from "@/models";
import { revalidatePath } from "next/cache";
import ROUTES, { DASHBOARDROUTES } from "@/constants/routes";
import mongoose, { Types } from "mongoose";
import { UnauthorizedError } from "../http-errors";

export async function PlaceOrder(
  params: upsertOrderParams
): Promise<ActionResponse> {
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

export async function UpdateOrderStatus(
  params: updateOrderStatusParams
): Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: updateOrderStatusSchema,
    authorizetionProccess: true,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const userId = validated.session?.user.id;
  const { orderId, status } = validated.params!;
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId },
      { status },
      { new: true }
    );
    if (!order) throw new Error("Failed to cancel order");

    revalidatePath(ROUTES.PROFILE);
    revalidatePath(DASHBOARDROUTES.ORDERS);
    revalidatePath(DASHBOARDROUTES.ORDERDETAILS(orderId));
    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getOrders(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ isNext: boolean; orders: OrderType[] }>> {
  const validated = await actionHandler({
    params,
    schema: PaginatedSearchParamsSchema,
    authorizetionProccess: true,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { page = 1, pageSize = 10, filter } = validated.params!;
  const skip = (page - 1) * pageSize;

  const session = validated.session;
  const userId = session?.user.id;

  try {
    if (!userId) throw new UnauthorizedError();

    const filterQuery: mongoose.QueryFilter<typeof Order> = {
      userId,
    };

    if (
      filter &&
      ["pending", "delivering", "cancelled", "delivered"].includes(filter)
    ) {
      filterQuery.status = filter;
    }

    const orders = await Order.find(filterQuery).skip(skip).limit(pageSize);
    const count = await Order.countDocuments(filterQuery);

    const isNext = count > orders.length + skip;
    return {
      success: true,
      data: { isNext, orders: JSON.parse(JSON.stringify(orders)) },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getAllOrders(
  params: PaginatedSearchParams
): Promise<PaginatedActionResponse<OrderDetailedType>> {
  const validated = await actionHandler({
    params,
    schema: PaginatedSearchParamsSchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { page = 1, pageSize = 10, filter } = validated.params!;

  const isAdmin = validated.session?.user.role === "admin";

  try {
    if (!isAdmin) throw new UnauthorizedError();
    const skip = (page - 1) * pageSize;
    const filterQuery: mongoose.QueryFilter<typeof Order> = {};
    if (
      filter &&
      ["pending", "delivering", "cancelled", "delivered"].includes(filter)
    ) {
      filterQuery.status = filter;
    }

    const [orders, total] = await Promise.all([
      Order.find(filterQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate({
          path: "userId",
          options: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transform: (doc: any) => doc,
          },
        })
        .lean()
        .then((orders) =>
          orders.map((order) => ({
            ...order,
            user: order.userId,
            userId: undefined,
          }))
        ),
      Order.countDocuments(filterQuery),
    ]);
    const isNext = total > orders.length + skip;
    return {
      success: true,
      data: { isNext, items: JSON.parse(JSON.stringify(orders)), total },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
