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

// types

type CategoryType = {
  _id: string;
  name: string;
  image: string;
  slug: string;
  isActive: boolean;
  parentId?: string;
}

type UploadedImageData = {
  success: boolean;
  fileId: string;
  url: string;
  thumbnailUrl: string;
  name: string;
}

// params

interface PaginatedSearchParams {
  page?: number;
  pageSize?: number;
  query?: string;
  filter?: string;
  sort?: string;
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

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
  name?: string;
  email: string;
  password: string;
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface ProductParams {
  title: string;
  description: string;
  category: string[]; 
  oldPrice?: number;
  newPrice: number;
  images: File[];
  variants: IVariant[];
  collection: "winter" | "summer";
  isActive?: boolean;
}

interface CategoryParams {
  parentId?: string;
  name: string;
  image: File;
  slug: string;
  isActive?: boolean;
}