import handleError from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import { dbConnect } from "@/lib/mongoose";
import { UserSchema } from "@/lib/validation";
import User from "@/models/user.model";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";
type ParamsType = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: ParamsType) {
  const { id } = await params;
  if (!id) throw new NotFoundError("User");
  try {
    await dbConnect();

    const user = await User.findById(id);
    if (!user) throw new NotFoundError("User");

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function PUT(request: Request, { params }: ParamsType) {
  const { id } = await params;
  if (!id) throw new NotFoundError("User");

  const body = await request.json();
  try {
    await dbConnect();

    const validatedUserData = UserSchema.partial().parse(body);

    const updatedUser = await User.findByIdAndUpdate(id, validatedUserData, {
      new: true,
    });
    if (!updatedUser) throw new NotFoundError("User");

    return NextResponse.json(
      { success: true, data: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function DELETE(request: Request, { params }: ParamsType) {
  const { id } = await params;
  if (!id) throw new NotFoundError("User");

  try {
    await dbConnect();
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) throw new NotFoundError("User");

    return NextResponse.json(
      { success: true, data: deletedUser },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
