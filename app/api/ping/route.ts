import { dbConnect } from "@/lib/mongoose";
import { APIResponse } from "@/types/global";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  return NextResponse.json({ status: 200 }) as APIResponse;
}
