"use server";

import {
  ActionResponse,
  changeUserRoleParams,
  ErrorResponse,
  PaginatedActionResponse,
  PaginatedSearchParams,
} from "@/types/global";
import actionHandler from "../handlers/action";
import {
  changeUserRoleSchema,
  PaginatedSearchParamsSchema,
} from "../validation";
import handleError from "../handlers/error";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import mongoose from "mongoose";
import { Account, User } from "@/models";
import { IUserDoc } from "@/models/user.model";
import { dbConnect } from "../mongoose";
import { revalidatePath } from "next/cache";
import { DASHBOARDROUTES } from "@/constants/routes";
import { auth } from "@/auth";

export async function getUsers(
  params: PaginatedSearchParams
): Promise<PaginatedActionResponse<IUserDoc>> {
  const validated = await actionHandler({
    params,
    schema: PaginatedSearchParamsSchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const isAdmin = validated.session?.user.role === "admin";
  if (!isAdmin)
    return handleError(
      new UnauthorizedError("Unauthorized access")
    ) as ErrorResponse;

  const { page = 1, pageSize = 10, filter, query } = validated.params!;
  const skip = (page - 1) * pageSize;
  try {
    const filterQuery: mongoose.QueryFilter<typeof User> = {};

    if (filter === "admins") filterQuery["role"] = "admin";
    else if (filter === "users") filterQuery["role"] = "user";

    if (query)
      filterQuery.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];

    const [count, users] = await Promise.all([
      User.countDocuments(filterQuery),
      User.find(filterQuery).skip(skip).limit(pageSize).lean(),
    ]);

    if (!users) throw new Error("Failed to fetch users");

    const isNext = skip + users.length < count;
    return {
      success: true,
      data: { isNext, items: JSON.parse(JSON.stringify(users)), total: count },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteUser(id: string): Promise<ActionResponse> {
  try {
    await dbConnect();
    const session = await auth();

    const isAdmin = session?.user.role === "admin";
    if (!isAdmin) throw new UnauthorizedError("Unauthorized access");

    const user = await User.findById(id);

    if (!user) throw new NotFoundError("User");

    if (user.role === "admin")
      throw new Error("Cannot delete admin users for security reasons.");

    await Promise.all([
      User.findByIdAndDelete(id),
      Account.deleteMany({ userId: id }),
    ]);

    revalidatePath(DASHBOARDROUTES.USERS);
    revalidatePath(DASHBOARDROUTES.USERDETAILS(id));
    return { success: true, data: null };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function ChangeRole(
  params: changeUserRoleParams
): Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: changeUserRoleSchema,
    authorizetionProccess: true,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { userId, role } = validated.params!;

  try {
    const isAdmin = validated.session?.user.role === "admin";
    const AdminId = validated.session?.user.id;
    if (!isAdmin)
      return handleError(
        new UnauthorizedError("Unauthorized access")
      ) as ErrorResponse;
    if (userId === AdminId)
      throw new Error(
        "Cannot change your own role for security reasons (Btl 3ak)."
      );

    const user = await User.findById(userId);

    if (!user) throw new NotFoundError("User");

    if (user.role === role)
      throw new Error(`User is already assigned the role of ${role}`);

    user.role = role;
    await user.save();

    revalidatePath(DASHBOARDROUTES.USERS);
    revalidatePath("/" , "layout");
    revalidatePath(DASHBOARDROUTES.USERDETAILS(userId));
    return { success: true, data: null };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserById(
  id: string
): Promise<ActionResponse<IUserDoc>> {
  try {
    await dbConnect();

    const user = await User.findById(id);
    if (!user) throw new NotFoundError("User");

    return { success: true, data: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
