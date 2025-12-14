import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import { dbConnect } from "@/lib/mongoose";
import { UserSchema } from "@/lib/validation";
import User from "@/models/user.model";
import { APIErrorResponse } from "@/types/global";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find();

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validatedData = UserSchema.safeParse(body);
    if (!validatedData.success)
      throw new ValidationError(validatedData.error.flatten().fieldErrors);

    const { data } = validatedData;

    const existingEmail = await User.findOne({ email: data.email });
    if (existingEmail) throw new Error("Email already exists");

    const newUser = await User.create(data);
    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
