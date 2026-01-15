"use server";

import {
  ActionResponse,
  addAddressParams,
  ErrorResponse,
} from "@/types/global";
import actionHandler from "../handlers/action";
import { addAddressSchema } from "../validation";
import handleError from "../handlers/error";
import { User } from "@/models";
import { IUserDoc } from "@/models/user.model";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import { dbConnect } from "../mongoose";
import { auth } from "@/auth";
import { UnauthorizedError } from "../http-errors";

export async function addAddress(
  params: addAddressParams
): Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: addAddressSchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  let { isDefault = false } = validated.params!;
  const userId = validated.session?.user.id;

  const { city, phone, details } = validated.params!;
  try {
    const user = (await User.findById(userId)) as IUserDoc;

    const isDuplicate = user.addresses.some(
      addr => addr.city === city && 
              addr.phone === phone && 
              addr.details === details
    );
    
    if (isDuplicate) {
      throw new Error("This address already exists");
    }

    const addresses = isDefault
      ? user.addresses.map((address) => ({ ...address, isDefault: false }))
      : user.addresses;

    if (addAddress.length === 0) isDefault = true;
    addresses.push({ ...validated.params!, isDefault });

    user.addresses = addresses;
    await user.save();

    revalidatePath(ROUTES.ADDRESSES);
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function setAddressAsDefault(addressId: string): Promise<ActionResponse> {
  try {
    await dbConnect();
    const session = await auth();
    const userId = session?.user.id;
    if (!userId) throw new UnauthorizedError();

    const user = (await User.findById(userId)) as IUserDoc;
    if (!user) throw new Error("User not found");

    user.addresses = user.addresses.map((address) => ({
      ...address,
      isDefault: address._id?.toString() === addressId,
    }));
    await user.save();

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
