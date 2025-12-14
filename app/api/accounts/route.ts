import handleError from "@/lib/handlers/error";
import { ForbiddenError, ValidationError } from "@/lib/http-errors";
import { dbConnect } from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validation";
import Account from "@/models/account.model";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const accounts = await Account.find();

    return NextResponse.json(
      { success: true, data: accounts },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validatedData = AccountSchema.partial().safeParse(body);
    if (!validatedData.success)
      throw new ValidationError(validatedData.error.flatten().fieldErrors);

    const { data } = validatedData;

    const existingAccount = await Account.findOne({
      provider: data.provider,
      providerAccountId: data.providerAccountId,
    });
    if (existingAccount)
      throw new ForbiddenError("Account with same provider already exists");

    const newAccount = await Account.create(data);
    return NextResponse.json(
      { success: true, data: newAccount },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
