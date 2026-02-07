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
import { IAddress, IUserDoc } from "@/models/user.model";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import { dbConnect } from "../mongoose";
import { auth } from "@/auth";
import { NotFoundError, UnauthorizedError } from "../http-errors";

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
  const { isDefault = false } = validated.params!;
  const userId = validated.session?.user.id;
  try {
    if (isDefault) {
      await User.updateOne(
        { _id: userId },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    await User.updateOne(
      { _id: userId },
      { $push: { addresses: { ...validated.params!, isDefault } } }
    );
    revalidatePath(ROUTES.ADDRESSES);
    revalidatePath(ROUTES.CART);
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function setAddressAsDefault(
  addressId: string
): Promise<ActionResponse> {
  try {
    await dbConnect();
    const session = await auth();
    const userId = session?.user.id;
    if (!userId) throw new UnauthorizedError();

    await User.updateOne(
      { _id: userId },
      { $set: { "addresses.$[].isDefault": false } }
    );

    await User.updateOne(
      { _id: userId, "addresses._id": addressId },
      { $set: { "addresses.$.isDefault": true } }
    );

    revalidatePath(ROUTES.ADDRESSES);
    return { success: true };
  } catch (error) {
    console.log("ERROR", error);

    return handleError(error) as ErrorResponse;
  }
}

export async function getAddresses(): Promise<ActionResponse<IAddress[]>> {
  try {
    await dbConnect();
    const session = await auth();
    const userId = session?.user.id;
    if (!userId) throw new UnauthorizedError();
    const user = await User.findById(userId)
      .select("addresses")
      .lean<IUserDoc>();
    if (!user) throw new NotFoundError("User");

    return { success: true, data: user.addresses };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
