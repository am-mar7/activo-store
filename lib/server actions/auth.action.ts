"use server";

import mongoose from "mongoose";
import { ActionResponse, AuthCredentials, ErrorResponse } from "@/types/global";
import handleError from "../handlers/error";
import { SignInSchema, SignUpSchema } from "../validation";
import User, { IUserDoc } from "@/models/user.model";
import bcrypt from "bcryptjs";
import Account, { IAccountDoc } from "@/models/account.model";
import { signIn } from "@/auth";
import { NotFoundError } from "../http-errors";
import actionHandler from "../handlers/action";

export async function credentialsSignUp(
  params: AuthCredentials
): Promise<ActionResponse> {
  const validated = await actionHandler({
    params: params,
    schema: SignUpSchema,
  });

  if (validated instanceof Error) 
    return handleError(validated) as ErrorResponse;
  
  const { name, email, password } = validated.params!;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) throw new Error("User aleady exits");

    const [hashedPassword, [newUser]] = await Promise.all([
      bcrypt.hash(password, 12),
      User.create([{ name, email }], { session }),
    ]);
    if (!newUser) throw new Error("Failed to create new User");

    await Account.create(
      [
        {
          userId: newUser._id,
          name,
          password: hashedPassword,
          provider: "credentials",
          providerAccountId: email,
        },
      ],
      { session }
    );
    await session.commitTransaction();

    await signIn("credentials", { email, password, redirect: false });

    return { success: true };
  } catch (error) {
    session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function credentialsSignIn(params: AuthCredentials) {
  const validated = await actionHandler({
    params: params,
    schema: SignInSchema,
  });
  if (validated instanceof Error) return handleError(validated);

  const { email, password } = validated.params!;
  try {
    const user = (await User.findOne({ email })) as IUserDoc;
    if (!user) throw new NotFoundError("User");

    const account = (await Account.findOne({
      userId: user._id,
      provider: "credentials",
      providerAccountId: email,
    })) as IAccountDoc;
    if (!account) throw new NotFoundError("Account");

    const isValidPassword = await bcrypt.compare(password, account.password!);
    if (!isValidPassword)
      throw new Error("Wrong email or password please Try again");

    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}
