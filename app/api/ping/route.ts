import { APIResponse } from "@/types/global";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: 200 }) as APIResponse;
}
