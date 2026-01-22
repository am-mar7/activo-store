"use server";

import {
  ActionResponse,
  editPromoCodeParams,
  ErrorResponse,
  promoCodeParams,
} from "@/types/global";
import actionHandler from "../handlers/action";
import { editPromoCodeSchema, PromoCodeSchema } from "../validation";
import handleError from "../handlers/error";
import { UnauthorizedError } from "../http-errors";
import { PromoCode } from "@/models";
import { IPromoCodeDoc } from "@/models/promoCode.model";

export async function addPromoCode(
  params: promoCodeParams
): Promise<ActionResponse<IPromoCodeDoc>> {
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
): Promise<ActionResponse<IPromoCodeDoc>> {
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
