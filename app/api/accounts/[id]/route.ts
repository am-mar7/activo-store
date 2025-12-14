import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import { dbConnect } from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validation";
import Account from "@/models/account.model";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";
type ParamsType = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: ParamsType) {
  const { id } = await params;
  if (!id) throw new NotFoundError("Account");
  try {
    await dbConnect();

    const account = await Account.findById(id);
    if (!account) throw new NotFoundError("Account");

    return NextResponse.json({ success: true, data: account }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function PUT(request: Request, { params }: ParamsType) {
  const { id } = await params;
  if (!id) throw new NotFoundError("Account");

  const body = await request.json();
  try {
    await dbConnect();

    const validatedData = AccountSchema.partial().safeParse(body);
    if (!validatedData.success)
      throw new ValidationError(validatedData.error.flatten().fieldErrors);

    const updatedAccount = await Account.findByIdAndUpdate(id, validatedData.data, {
      new: true,
    });
    console.log(validatedData, updatedAccount);

    if (!updatedAccount) throw new NotFoundError("Account");

    return NextResponse.json(
      { success: true, data: updatedAccount },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function DELETE(request: Request, { params }: ParamsType) {
  const { id } = await params;
  if (!id) throw new NotFoundError("Account");

  try {
    await dbConnect();
    const deletedAccount = await Account.findByIdAndDelete(id);

    if (!deletedAccount) throw new NotFoundError("Account");

    return NextResponse.json(
      { success: true, data: deletedAccount },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
