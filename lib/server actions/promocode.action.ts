"use server";

import {
  ActionResponse,
  editPromoCodeParams,
  ErrorResponse,
  PaginatedActionResponse,
  PaginatedSearchParams,
  promoCodeParams,
  PromoCodeType,
} from "@/types/global";
import actionHandler from "../handlers/action";
import {
  editPromoCodeSchema,
  PaginatedSearchParamsSchema,
  PromoCodeSchema,
} from "../validation";
import handleError from "../handlers/error";
import { UnauthorizedError } from "../http-errors";
import { PromoCode } from "@/models";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "../mongoose";

export async function addPromoCode(
  params: promoCodeParams
): Promise<ActionResponse<PromoCodeType>> {
  const validated = await actionHandler({
    params,
    schema: PromoCodeSchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  try {
    const isAdmin = validated.session?.user.role === "admin";
    if (!isAdmin) throw new UnauthorizedError();

    const [promo] = await PromoCode.create([validated.params!]);
    if (!promo) throw new Error("Failed to create promo code");

    return { success: true, data: JSON.parse(JSON.stringify(promo)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function editPromoCode(
  params: editPromoCodeParams
): Promise<ActionResponse<PromoCodeType>> {
  const validated = await actionHandler({
    params,
    schema: editPromoCodeSchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, code, ...data } = validated.params!;

  try {
    const isAdmin = validated.session?.user.role === "admin";
    if (!isAdmin) throw new UnauthorizedError();

    const updatedPromo = await PromoCode.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedPromo) throw new Error("Promo code not found");

    return { success: true, data: JSON.parse(JSON.stringify(updatedPromo)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getPromoCodes(
  params: PaginatedSearchParams
): Promise<PaginatedActionResponse<PromoCodeType>> {
  const validated = await actionHandler({
    params,
    schema: PaginatedSearchParamsSchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { page = 1, pageSize = 10, query, filter } = validated.params!;

  const isAdmin = validated.session?.user.role === "admin";
  try {
    if (!isAdmin) throw new UnauthorizedError();
    const skip = (page - 1) * pageSize;

    const filterQuery: mongoose.QueryFilter<typeof PromoCode> = {};

    if (query) {
      filterQuery.code = { $regex: query, $options: "i" };
    }

    if (filter) {
      switch (filter) {
        case "active":
          filterQuery.$and = [
            {
              $or: [
                { expiredAt: { $exists: false } },
                { expiredAt: null },
                { expiredAt: { $gt: new Date() } },
              ],
            },
            {
              $or: [
                { usageLimit: { $exists: false } },
                { usageLimit: null },
                { $expr: { $lt: ["$usageCount", "$usageLimit"] } },
              ],
            },
          ];
          break;

        case "expired":
          filterQuery.expiredAt = { $lte: new Date() };
          break;

        case "limitReached":
          filterQuery.$and = [
            { usageLimit: { $exists: true, $ne: null } },
            { $expr: { $gte: ["$usageCount", "$usageLimit"] } },
          ];
          break;

        case "unlimited":
          filterQuery.$and = [
            {
              $or: [{ usageLimit: { $exists: false } }, { usageLimit: null }],
            },
            {
              $or: [{ expiredAt: { $exists: false } }, { expiredAt: null }],
            },
          ];
          break;

        case "expiringsSoon":
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          filterQuery.expiredAt = {
            $gte: new Date(),
            $lte: nextWeek,
          };
          break;

        case "neverUsed":
          filterQuery.usageCount = 0;
          break;

        case "mostUsed":
        default:
          break;
      }
    }

    let sortCriteria: Record<string, 1 | -1> = { createdAt: -1 };
    if (filter === "mostUsed") {
      sortCriteria = { usageCount: -1 };
    }

    const [total, promos] = await Promise.all([
      PromoCode.countDocuments(filterQuery),
      PromoCode.find(filterQuery).sort(sortCriteria).skip(skip).limit(pageSize),
    ]);

    const isNext = total > promos.length + skip;

    return {
      success: true,
      data: { items: JSON.parse(JSON.stringify(promos)), isNext, total },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deletePromoCode(id: string): Promise<ActionResponse> {
  try {
    await dbConnect();
    const session = await auth();
    const isAdmin = session?.user.role === "admin";
    if (!isAdmin) throw new UnauthorizedError();

    const code = await PromoCode.findByIdAndDelete(id);
    if (!code) throw new Error("Promo code not found");

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getPromoCode(
  id: string
): Promise<ActionResponse<PromoCodeType>> {
  try {
    await dbConnect();

    const code = await PromoCode.findById(id);
    if (!code) throw new Error("Promo code not found");

    return { success: true, data: JSON.parse(JSON.stringify(code)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
