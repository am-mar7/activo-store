"use server";

import {
  ActionResponse,
  AnalyticsChartsType,
  AnalyticsPoint,
  CategoryPerformance,
  ErrorResponse,
  FormattedAnalyticsPoint,
  KPIParams,
  KPIType,
  TopProduct,
  WorstProduct,
} from "@/types/global";
import actionHandler from "../handlers/action";
import { kpiSchema } from "../validation";
import handleError from "../handlers/error";
import { Order, User, Wishlist } from "@/models";
import { log } from "console";
import { dbConnect } from "../mongoose";
import { auth } from "@/auth";
import { UnauthorizedError } from "../http-errors";

function resolveTimeUnit(from: Date, to: Date) {
  const days = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);

  if (days <= 14) return "day";
  if (days <= 90) return "week";
  return "month";
}

function resolveDateRange(
  from?: Date | string,
  to?: Date | string,
  preset?: string
) {
  const now = new Date();

  let fromDate: Date;
  let toDate: Date = new Date();

  if (preset) {
    switch (preset) {
      case "day":
        fromDate = new Date(now.setHours(0, 0, 0, 0));
        toDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case "week":
        fromDate = new Date();
        fromDate.setDate(now.getDate() - 7);
        break;
      case "month":
        fromDate = new Date();
        fromDate.setMonth(now.getMonth() - 1);
        break;
      default:
        fromDate = new Date();
        fromDate.setDate(now.getDate() - 30);
    }
  } else {
    fromDate = from
      ? new Date(from)
      : new Date(now.setDate(now.getDate() - 30));
    toDate = to ? new Date(to) : new Date();
  }
  return { fromDate, toDate };
}

function formatChartData(
  data: AnalyticsPoint[],
  unit: "day" | "week" | "month"
): FormattedAnalyticsPoint[] {
  return data.map((point) => {
    const date = new Date(point.date);

    let label: string;

    switch (unit) {
      case "day":
        label = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        break;

      case "week":
        const end = new Date(date);
        end.setDate(date.getDate() + 6);
        label = `${date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${end.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`;
        break;

      case "month":
        label = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        break;

      default:
        label = date.toLocaleDateString();
    }

    return {
      date,
      label,
      value: point.value,
    };
  });
}

export async function getKPIs(
  params: KPIParams
): Promise<ActionResponse<KPIType>> {
  const validated = await actionHandler({
    params,
    schema: kpiSchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { from, to, preset } = validated.params!;

  const { fromDate, toDate } = resolveDateRange(from, to, preset);

  const periodDays = Math.ceil(
    (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const prevFromDate = new Date(fromDate);
  prevFromDate.setDate(prevFromDate.getDate() - periodDays);
  const prevToDate = new Date(fromDate);
  prevToDate.setSeconds(prevToDate.getSeconds() - 1);

  try {
    const isAdmin = validated.session?.user.role === "admin";
    if (!isAdmin) throw new Error("Unauthorized access");

    const fetchOrders = async (start: Date, end: Date) =>
      Order.find({
        createdAt: { $gte: start, $lte: end },
        "payment.status": "completed",
        status: { $ne: "cancelled" },
      }).lean();

    const [currentOrders, previousOrders] = await Promise.all([
      fetchOrders(fromDate, toDate),
      fetchOrders(prevFromDate, prevToDate),
    ]);

    const totalRevenue = currentOrders.reduce(
      (sum, o) => sum + o.totalPrice,
      0
    );
    const previousRevenue = previousOrders.reduce(
      (sum, o) => sum + o.totalPrice,
      0
    );
    const revenueChangePercent = previousRevenue
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    const totalOrders = currentOrders.length;
    const previousOrdersCount = previousOrders.length;
    const ordersChangePercent = previousOrdersCount
      ? ((totalOrders - previousOrdersCount) / previousOrdersCount) * 100
      : 0;

    const currentCustomerIds = new Set(
      currentOrders.map((o) => o.userId.toString())
    );
    log("CURRENT CUSTOMERS", currentCustomerIds);
    const firstOrdersByPeriod = await Order.aggregate([
      {
        $match: {
          "payment.status": "completed",
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: "$userId",
          firstOrder: { $min: "$createdAt" },
        },
      },
      {
        $facet: {
          current: [
            {
              $match: {
                firstOrder: { $gte: fromDate, $lte: toDate },
              },
            },
            { $count: "count" },
          ],
          previous: [
            {
              $match: {
                firstOrder: { $gte: prevFromDate, $lte: prevToDate },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    const newCustomers = firstOrdersByPeriod[0]?.current[0]?.count || 0;
    const previousNewCustomers =
      firstOrdersByPeriod[0]?.previous[0]?.count || 0;

    const customersChangePercent = previousNewCustomers
      ? ((newCustomers - previousNewCustomers) / previousNewCustomers) * 100
      : 0;

    const aov = totalOrders ? totalRevenue / totalOrders : 0;
    const previousAov = previousOrdersCount
      ? previousRevenue / previousOrdersCount
      : 0;
    const aovChangePercent = previousAov
      ? ((aov - previousAov) / previousAov) * 100
      : 0;

    return {
      success: true,
      data: {
        revenue: {
          total: totalRevenue,
          previous: previousRevenue,
          changePercent: parseFloat(revenueChangePercent.toFixed(1)),
        },
        orders: {
          total: totalOrders,
          previous: previousOrdersCount,
          changePercent: parseFloat(ordersChangePercent.toFixed(1)),
        },
        customers: {
          total: currentCustomerIds.size,
          new: newCustomers,
          previousNew: previousNewCustomers,
          changePercent: parseFloat(customersChangePercent.toFixed(1)),
        },
        aov: {
          value: parseFloat(aov.toFixed(1)),
          previous: parseFloat(previousAov.toFixed(1)),
          changePercent: parseFloat(aovChangePercent.toFixed(1)),
        },
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getAnalyticsCharts(
  params: KPIParams
): Promise<ActionResponse<AnalyticsChartsType>> {
  const validated = await actionHandler({
    params,
    schema: kpiSchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { from, to, preset } = validated.params!;

  const { fromDate, toDate } = resolveDateRange(from, to, preset);

  try {
    const isAdmin = validated.session?.user.role === "admin";
    if (!isAdmin) throw new Error("Unauthorized access");

    const timeUnit = resolveTimeUnit(fromDate, toDate);

    const orderMatch = {
      createdAt: { $gte: fromDate, $lte: toDate },
      "payment.status": "completed",
      status: { $ne: "cancelled" },
    };

    const [revenueOverTime, ordersOverTime, userGrowth] = await Promise.all([
      Order.aggregate([
        { $match: orderMatch },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: "$createdAt",
                unit: timeUnit,
              },
            },
            value: { $sum: "$totalPrice" },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", value: 1 } },
      ]),

      Order.aggregate([
        { $match: orderMatch },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: "$createdAt",
                unit: timeUnit,
              },
            },
            value: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", value: 1 } },
      ]),

      User.aggregate([
        {
          $match: {
            createdAt: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: "$createdAt",
                unit: timeUnit,
              },
            },
            value: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", value: 1 } },
      ]),
    ]);

    return {
      success: true,
      data: {
        revenueOverTime: formatChartData(revenueOverTime, timeUnit),
        ordersOverTime: formatChartData(ordersOverTime, timeUnit),
        userGrowth: formatChartData(userGrowth, timeUnit),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getTopProducts(
  params: KPIParams
): Promise<
  ActionResponse<{ byRevenue: TopProduct[]; byQuantity: TopProduct[] }>
> {
  const validated = await actionHandler({
    params,
    schema: kpiSchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { from, to, preset } = validated.params!;

  const { fromDate, toDate } = resolveDateRange(from, to, preset);

  try {
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: fromDate, $lte: toDate },
          "payment.status": "completed",
          status: { $ne: "cancelled" },
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          productTitle: { $first: "$orderItems.productTitle" },
          productImage: { $first: "$orderItems.productImage" },
          soldQty: { $sum: "$orderItems.quantity" },
          revenue: { $sum: "$orderItems.subTotal" },
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          title: "$productTitle",
          image: "$productImage",
          soldQty: 1,
          revenue: 1,
        },
      },
      {
        $facet: {
          byRevenue: [{ $sort: { revenue: -1 } }, { $limit: 5 }],
          byQuantity: [{ $sort: { soldQty: -1 } }, { $limit: 5 }],
        },
      },
    ]).hint({ createdAt: 1, "payment.status": 1, status: 1 });
    if (!result) throw new Error("Failed to get Top Products");

    return {
      success: true,
      data: {
        byRevenue: JSON.parse(JSON.stringify(result[0]?.byRevenue)) ?? [],
        byQuantity: JSON.parse(JSON.stringify(result[0]?.byQuantity)) ?? [],
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getWorstProducts(): Promise<
  ActionResponse<WorstProduct[]>
> {
  try {
    await dbConnect();
    const session = await auth();

    const isAdmin = session?.user.role === "admin";
    if (!isAdmin) throw new UnauthorizedError("Unauthorized access");

    const result = await Wishlist.aggregate([
      {
        $group: {
          _id: "$productId",
          wishlistCount: { $sum: 1 },
        },
      },
      {
        $match: {
          wishlistCount: { $gte: 5 },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $match: {
          "product.createdAt": {
            $lte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                status: "delivered",
                "payment.status": "completed",
              },
            },
            { $unwind: "$orderItems" },
            {
              $match: {
                $expr: {
                  $eq: ["$orderItems.product", "$$productId"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                "orderItems.quantity": 1,
              },
            },
          ],
          as: "matchedOrders",
        },
      },
      {
        $addFields: {
          soldQty: {
            $sum: {
              $map: {
                input: "$matchedOrders",
                as: "order",
                in: "$$order.orderItems.quantity",
              },
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              { $eq: ["$soldQty", 0] },
              {
                $lte: [{ $multiply: ["$soldQty", 10] }, "$wishlistCount"],
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          title: "$product.title",
          image: { $arrayElemAt: ["$product.images", 0] },
          wishlistCount: 1,
          soldQty: 1,
        },
      },
      { $sort: { wishlistCount: -1 } },
      { $limit: 5 },
    ]);
    if (!result) throw new Error("Failed to get Top Products");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(result)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getCategoriesPerfromance(
  params: KPIParams
): Promise<ActionResponse<CategoryPerformance[]>> {
  const validated = await actionHandler({
    params,
    schema: kpiSchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { from, to, preset } = validated.params!;
  const { fromDate, toDate } = resolveDateRange(from, to, preset);
  
  try {
    const result = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          "payment.status": "completed",
          createdAt: {
            $gte: fromDate,
            $lte: toDate,
          },
        },
      },    
      { $unwind: "$orderItems" },    
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          name: { $first: "$category.name" },
    
          revenue: {
            $sum: {
              $multiply: [
                "$orderItems.priceAtPurchase",
                "$orderItems.quantity",
              ],
            },
          },
          soldQty: { $sum: "$orderItems.quantity" },
          orders: { $addToSet: "$_id" },
        },
      },    
      {
        $addFields: {
          ordersCount: { $size: "$orders" },
        },
      },    
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          name: 1,
          revenue: 1,
          soldQty: 1,
          ordersCount: 1,
        },
      },
    
      { $sort: { revenue: -1 } },
    ]);   

    if (!result) throw new Error("Failed to get Top Products");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(result)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}