"use server";
import { ZodError, ZodSchema } from "zod";
import { UnauthorizedError, ValidationError } from "../http-errors";
import { Session } from "next-auth";
import { auth } from "@/auth";
import { dbConnect } from "../mongoose";
import mongoose from "mongoose";
export interface ActionOptions<T> {
  params?: T;
  schema?: ZodSchema<T>;
  authorizetionProccess?: boolean;
}

export default async function actionHandler<T>({
  params,
  schema,
  authorizetionProccess = false,
}: ActionOptions<T>) {
  if (params && schema) {
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError)
        return new ValidationError(error.flatten().fieldErrors);
      else return new Error("schema validation failed");
    }
  }

  let session: Session | null = null;
  if (authorizetionProccess) {
    session = await auth();
    if (!session) return new UnauthorizedError();
  }

  try {
    await dbConnect();
    
    // Double-check connection is ready
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database connection not ready");
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Database connection error:", error);

    // Check for specific error types
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (
      errorMessage.includes("timeout") ||
      errorMessage.includes("timed out") ||
      errorMessage.includes("server monitor timeout") ||
      errorMessage.includes("server selection")
    ) {
      return new Error("Connection timeout. Please check your network and try again.");
    }

    if (
      errorMessage.includes("buffering") ||
      errorMessage.includes("interrupted")
    ) {
      return new Error("Connection interrupted. Please try again.");
    }

    if (errorMessage.includes("enotfound") || errorMessage.includes("dns")) {
      return new Error("Something went wrong. Please check your internet connection.");
    }

    return new Error(
      "Connection failed. Please check your network and try again."
    );
  }

  return { session, params };
}
