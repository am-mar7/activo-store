"use server";

import {
  ActionResponse,
  ErrorResponse,
  getUserOrdersParams,
  OrderDetailedType,
  OrderType,
  PaginatedActionResponse,
  PaginatedSearchParams,
  updateOrderStatusParams,
  updatePaymentStatusParams,
  upsertOrderParams,
} from "@/types/global";
import actionHandler from "../handlers/action";
import {
  getUserOrdersSchema,
  PaginatedSearchParamsSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  upsertOrderSchema,
} from "../validation";
import handleError from "../handlers/error";
import { Cart, Order } from "@/models";
import { revalidatePath } from "next/cache";
import ROUTES, { DASHBOARDROUTES } from "@/constants/routes";
import mongoose, { Types } from "mongoose";
import { UnauthorizedError } from "../http-errors";
import { dbConnect } from "../mongoose";
import { auth } from "@/auth";

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
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) throw new Error("Order not found");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { status };

    if (order.payment?.method === "COD") {
      if (status === "cancelled") {
        updateData["payment.status"] = "failed";
      } else if (status === "delivered") {
        updateData["payment.status"] = "completed";
      }
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, userId },
      updateData,
      { new: true }
    );

    if (!updatedOrder) throw new Error("Failed to update order");

    revalidatePath(ROUTES.PROFILE);
    revalidatePath(DASHBOARDROUTES.ORDERS);
    revalidatePath(DASHBOARDROUTES.ORDERDETAILS(orderId));
    
    return { success: true, data: JSON.parse(JSON.stringify(updatedOrder)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function upatePaymentStatus(
  params: updatePaymentStatusParams
): Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: updatePaymentStatusSchema,
    authorizetionProccess: true,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const userId = validated.session?.user.id;
  const { orderId, status } = validated.params!;
  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId },
      { "payment.status": status },
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
  params: getUserOrdersParams
): Promise<ActionResponse<{ isNext: boolean; orders: OrderType[] }>> {
  const validated = await actionHandler({
    params,
    schema: getUserOrdersSchema,
    authorizetionProccess: true,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { page = 1, pageSize = 10, filter, userId } = validated.params!;
  const skip = (page - 1) * pageSize;

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

  const { page = 1, pageSize = 10, filter, query } = validated.params!;

  const isAdmin = validated.session?.user.role === "admin";

  try {
    if (!isAdmin) throw new UnauthorizedError();
    const skip = (page - 1) * pageSize;

    const baseFilter: mongoose.QueryFilter<typeof Order> = {};
    if (
      filter &&
      ["pending", "delivering", "cancelled", "delivered"].includes(filter)
    )
      baseFilter.status = filter;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [
      ...(Object.keys(baseFilter).length > 0 ? [{ $match: baseFilter }] : []),
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      ...(query
        ? [
            {
              $match: {
                $or: [
                  { "user.name": { $regex: query, $options: "i" } },
                  { "user.email": { $regex: query, $options: "i" } },
                ],
              },
            },
          ]
        : []),
      {
        $sort: { createdAt: -1 },
      },
    ];
    const countPipeline = [...pipeline, { $count: "total" }];

    const dataPipeline = [
      ...pipeline,
      { $skip: skip },
      { $limit: pageSize },
      {
        $project: {
          userId: 0,
        },
      },
    ];

    const [ordersResult, countResult] = await Promise.all([
      Order.aggregate(dataPipeline),
      Order.aggregate(countPipeline),
    ]);

    const orders = ordersResult;
    const total = countResult[0]?.total || 0;
    const isNext = total > orders.length + skip;

    return {
      success: true,
      data: { isNext, items: JSON.parse(JSON.stringify(orders)), total },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getOrder(
  id: string
): Promise<ActionResponse<OrderDetailedType>> {
  try {
    await dbConnect();
    const session = await auth();
    const isAdmin = session?.user.role === "admin";
    const userId = session?.user.id;
    const order = await Order.findById(id)
      .populate("userId", "name email phone _id image")
      .lean()
      .then((order) => {
        if (!order) return null;
        return {
          ...order,
          user: order.userId,
          userId: undefined,
        };
      });

    if (!order) throw new Error("Order not found");
    if (!isAdmin && (!order.user || order.user._id.toString() !== userId))
      throw new UnauthorizedError();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(order)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
