"use server";
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  sendEmailSchema,
} from "./../validation";
import mongoose from "mongoose";
import {
  ActionResponse,
  AuthCredentials,
  ErrorResponse,
  ResetPasswordParams,
  sendEmailParams,
} from "@/types/global";
import handleError from "../handlers/error";
import { SignInSchema, SignUpSchema } from "../validation";
import User, { IUserDoc } from "@/models/user.model";
import bcrypt from "bcryptjs";
import Account, { IAccountDoc } from "@/models/account.model";
import { signIn } from "@/auth";
import { NotFoundError } from "../http-errors";
import actionHandler from "../handlers/action";
import { signOut } from "@/auth";
import ROUTES from "@/constants/routes";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function Logout(redirection = ROUTES.HOME) {
  await signOut({ redirectTo: redirection });
}

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
    const devEmail = process.env.DEVEMAIL || "ammar.omar@a2sv.org";
    const role = devEmail === email ? "admin" : "user";

    const [hashedPassword, [newUser]] = await Promise.all([
      bcrypt.hash(password, 12),
      User.create([{ name, email, role }], { session }),
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
    const user = await User.findOne({ email }).lean<IUserDoc>();
    if (!user) throw new NotFoundError("User");

    const account = await Account.findOne({
      userId: user._id,
      provider: "credentials",
      providerAccountId: email,
    }).lean<IAccountDoc>();
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

export async function sendEmail(
  params: sendEmailParams
): Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: sendEmailSchema,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { to, subject, message } = validated.params!;
  try {
    await resend.emails.send({
      from: "Activo <onboarding@resend.dev>",
      to,
      subject,
      html: message,
    });
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function sendPasswordResetEmail(email: string) {
  const validated = await actionHandler({
    params: { email },
    schema: ForgotPasswordSchema,
  });

  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { email: validEmail } = validated.params!;

  try {
    const [user, account] = await Promise.all([
      User.findOne({ email: validEmail }),
      Account.findOne({
        providerAccountId: validEmail,
        provider: "credentials",
      }),
    ]);

    if (!user) throw new NotFoundError("User");
    if (!account)
      throw new Error(
        "This account was created using Google. You cannot change the password directly. Please sign in using your social login."
      );

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000);
    await User.findByIdAndUpdate(user._id, {
      resetToken: hashedToken,
      resetTokenExpiry,
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}${ROUTES.RESET_PASSWORD}?token=${resetToken}`;
    const emailHTML = `
      <p>Click the link below to reset your password:</p>
      <p>Please don't share this link with any one</p>
      <a href='${resetUrl}'>Reset Password</a>
    `;

    const { success, error } = await sendEmail({
      to: validEmail,
      subject: "Reset Your Activo Password",
      message: emailHTML,
    });

    return { success, error };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function resetPassword(
  params: ResetPasswordParams
): Promise<ActionResponse> {
  const validated = await actionHandler({
    params,
    schema: ResetPasswordSchema,
  });
  if (validated instanceof Error)
    return handleError(validated) as ErrorResponse;

  const { token, password } = validated.params!;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = (await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    })) as IUserDoc;

    if (!user) throw new NotFoundError("Reset token is invalid or expired");

    const hashedPassword = await bcrypt.hash(password, 12);

    user.resetToken = "";
    user.resetTokenExpiry = undefined;

    await Account.findOneAndUpdate(
      { userId: user._id },
      { password: hashedPassword }
    );
    await user.save();

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
