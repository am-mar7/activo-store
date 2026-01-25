"use server";

import {
  ActionResponse,
  ErrorResponse,
  KPIParams,
  KPIType,
} from "@/types/global";
import actionHandler from "../handlers/action";
import { kpiSchema } from "../validation";
import handleError from "../handlers/error";
import { Order } from "@/models";
import { log } from "console";

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

  try {
    const isAdmin = validated.session?.user.role === "admin";
    if (!isAdmin) throw new Error("Unauthorized access");

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
          fromDate = new Date(now);
          fromDate.setDate(now.getDate() - 7);
          break;
        case "month":
          fromDate = new Date(now);
          fromDate.setMonth(now.getMonth() - 1);
          break;
        default:
          fromDate = new Date(now);
          fromDate.setDate(now.getDate() - 30);
      }
    } else {
      const defaultFrom = new Date();
      defaultFrom.setDate(now.getDate() - 30);
      fromDate = from ? new Date(from) : defaultFrom;
      toDate = to ? new Date(to) : new Date();
    }

    const periodDays = Math.ceil(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const prevFromDate = new Date(fromDate);
    prevFromDate.setDate(prevFromDate.getDate() - periodDays);
    const prevToDate = new Date(fromDate);
    prevToDate.setSeconds(prevToDate.getSeconds() - 1);

    const fetchOrders = async (start: Date, end: Date) =>
      Order.find({
        createdAt: { $gte: start, $lte: end },
        "payment.status": "completed",
        status: { $ne: "cancelled" },
      }).lean();

    console.log("DATES!!", fromDate, toDate, prevFromDate, prevToDate);

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

    const currentCustomerIds = new Set(currentOrders.map((o) => o.userId.toString()));
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
