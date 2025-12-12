import { NextResponse } from "next/server";

interface ActionResponse<T = null> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
}

type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
type ErrorResponse = ActionResponse<undefined> & { success: false };
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;
type APIErrorResponse = NextResponse<ErrorResponse>;

// params

interface SignInWithOauthParams {
  provider: "google" | "github";
  providerAccountId: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

interface AuthCredentials {
  email: string;
  password: string;
}
interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}
