import { IPayment } from "@/models/order.model";
import { IUserDoc } from "@/models/user.model";
import { NextResponse } from "next/server";
import { ReactNode } from "react";

interface ActionResponse<T = null> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
}

interface PaginatedActionResponse<T> extends ActionResponse {
  data?: {
    items: T[];
    total: number;
    isNext: boolean;
  };
}

type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
type ErrorResponse = ActionResponse<undefined> & { success: false };
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;
type APIErrorResponse = NextResponse<ErrorResponse>;

// types

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: keyof T;
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

type CategoryType = {
  _id: string;
  name: string;
  image: string;
  slug: string;
  isActive: boolean;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
};

type ProductType = {
  _id: string;
  title: string;
  description: string;
  category: string[];
  oldPrice?: number;
  newPrice: number;
  stock?: number;
  variants?: IVariant[];
  collection: "winter" | "summer" | "both" | "none";
  averageRating: number;
  totalReviews: number;
  images: string[];
  sizeGuide?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type PromoCodeType = {
  _id: string;
  code: string;
  percentage: number;
  maxDiscount: number;
  usageLimit?: number;
  usageCount: number;
  minPurchase: number;
  expiredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

type KPIType = {
  revenue: {
    total: number;
    previous: number;
    changePercent: number;
  };
  orders: {
    total: number;
    previous: number;
    changePercent: number;
  };
  customers: {
    total: number;
    new: number;
    previousNew: number;
    changePercent: number;
  };
  aov: {
    value: number;
    previous: number;
    changePercent: number;
  };
};

export type AnalyticsPoint = {
  date: Date;
  value: number;
};

type FormattedAnalyticsPoint = {
  date: Date;
  label: string;
  value: number;
};

export type AnalyticsChartsType = {
  revenueOverTime: FormattedAnalyticsPoint[];
  ordersOverTime: FormattedAnalyticsPoint[];
  userGrowth: FormattedAnalyticsPoint[];
};

interface TopProduct {
  productId: string;
  title: string;
  image?: string;
  soldQty: number;
  revenue: number;
}

interface WorstProduct extends Omit<TopProduct, "revenue"> {
  wishlistCount: number;
}

export type AdminAlert = {
  id: string;
  type:
    | "REVENUE_DROP"
    | "ORDERS_DROP"
    | "AOV_DROP"
    | "WORST_PRODUCTS"
    | "CATEGORY_PERFORMANCE";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>;
};

type CategoryPerformance = {
  categoryId: string;
  name: string;
  revenue: number;
  soldQty: number;
  ordersCount: number;
};

type UploadedImageData = {
  success: boolean;
  fileId: string;
  url: string;
  thumbnailUrl: string;
  name: string;
};

export interface OrderItemType {
  product: string;
  variantSku?: string;
  variantColor?: string;
  variantSize?: string;
  productTitle: string;
  productImage: string;
  priceAtPurchase: number;
  quantity: number;
  subTotal?: number;
}

export interface PaymentType {
  method: "visa" | "COD";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  gatewayResponse?: object;
}

export interface CodeType {
  code: string;
  discount: number;
  discountAmount: number;
}

export interface ShippingAddressType {
  city: string;
  phone: string;
  details: string;
}

export interface OrderType {
  _id?: string;
  userId: string;
  orderItems: OrderItemType[];
  totalPrice: number;
  status: "pending" | "delivering" | "cancelled" | "delivered";
  shippingAddress: ShippingAddressType;
  payment: PaymentType;
  shippingCost: number;
  promoCode?: CodeType;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderDetailedType extends Omit<OrderType, "userId"> {
  user?: IUserDoc;
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

interface ResetPasswordParams {
  token: string;
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
  sizeGuide?: File;
  variants?: IVariant[];
  stock?: number;
  collection: "winter" | "summer" | "both" | "none";
  isActive?: boolean;
}

interface EditProductParams extends ProductParams {
  id: string;
  oldImages: string[];
  oldSizeGuide?: string | null;
}

interface CategoryParams {
  parentId?: string;
  name: string;
  image: File;
  slug: string;
  isActive?: boolean;
}

interface EditCategoryParams extends CategoryParams {
  id: string;
  image?: File;
}

interface getCategoriedProductsParams extends PaginatedSearchParams {
  slug: string;
}

interface getProductsByCategoryIdParams extends PaginatedSearchParams {
  id: string;
}

interface UpsertCartItemParams {
  product: string;
  sku?: string;
  quantity: number;
  type: "add" | "update";
}

interface cartState {
  product: string;
  variantSku?: string;
  quantity: number;
}

interface cartItem {
  product: ProductType;
  variantSku?: string;
  quantity: number;
}

interface removeFromCartParams {
  product: string;
  sku?: string;
}

interface OrderItemType {
  product: string;
  variantSku?: string;
  variantColor?: string;
  variantSize?: string;
  productTitle: string;
  productImage: string;
  priceAtPurchase: number;
  quantity: number;
  subTotal?: number;
}

interface upsertOrderParams {
  orderItems: OrderItemType[];
  totalPrice: number;
  shippingAddress: {
    city: string;
    phone: string;
    details: string;
  };
  status?: "pending" | "delivering" | "cancelled" | "delivered";
  payment: IPayment;
  shippingCost: number;
  promoCode?: {
    code: string;
    discount: number;
    discountAmount: number;
  };
}

interface getUserOrdersParams extends PaginatedSearchParams {
  userId: string;
}

interface addAddressParams {
  city: string;
  phone: string;
  details: string;
  isDefault: boolean;
}

interface updateOrderStatusParams {
  orderId: string;
  status: "pending" | "delivering" | "cancelled" | "delivered";
}

interface updatePaymentStatusParams {
  orderId: string;
  status: "pending" | "completed" | "failed" | "refunded";
}

interface changeUserRoleParams {
  userId: string;
  role: "admin" | "user";
}

interface promoCodeParams {
  code: string;
  percentage: number;
  maxDiscount: number;
  minPurchase: number;
  usageLimit?: number;
  expiredAt?: Date;
}

interface editPromoCodeParams extends promoCodeParams {
  id: string;
}

interface KPIParams {
  from?: string | Date;
  to?: string | Date;
  preset?: "day" | "week" | "month";
}

interface SettingsParams {
  shipping: {
    cost: number;
  };
  heroSection: {
    enabled: boolean;
    title?: string;
    subtitle?: string;
    image?: File;
    cta?: {
      text: string;
      href: string;
    };
  };
  topBanner: {
    enabled: boolean;
    text?: string;
    backgroundColor?: string;
    textColor?: string;
    link?: string;
    startsAt?: Date;
    endsAt?: Date;
  };
  checkout: {
    allowCOD: boolean;
    allowOnlinePayment: boolean;
  };
  maintenance: {
    enabled: boolean;
    message?: string;
  };
}

interface SettingsType extends Omit<SettingsParams, "heroSection"> {
  heroSection: {
    enabled: boolean;
    title?: string;
    subtitle?: string;
    image?: string;
    cta?: {
      text: string;
      href: string;
    };
  };
}

interface SearchProductResult {
  _id: Types.ObjectId;
  title: string;
  description: string;
  newPrice: number;
  oldPrice?: number;
  images: string[];
  variants?: {
    sku: string;
    color?: string;
    size?: string;
    stock: number;
    image?: string;
  }[];
  stock?: number;
  collection: "winter" | "summer" | "both" | "none";
  averageRating: number;
  totalReviews: number;
  sold: number;
  categoryDetails: {
    _id: Types.ObjectId;
    name: string;
    slug: string;
  };
}

interface sendEmailParams {
  to: string;
  subject: string;
  message: string;
}
