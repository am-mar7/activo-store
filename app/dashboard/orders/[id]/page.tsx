import TryAgain from "@/components/TryAgain";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { getOrder } from "@/lib/server actions/order.action";
import { RouteParams } from "@/types/global";
import React, { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  CreditCard,
  User,
  Mail,
  Phone,
  Calendar,
  Truck,
  Tag,
  ShoppingBag,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import Image from "next/image";
import Link from "next/link";
import ROUTES, { DASHBOARDROUTES } from "@/constants/routes";
import { StatusSelect } from "@/components/buttons/StatusSelect";
import Loading from "@/app/loading";

export default function OrderDetails({ params, searchParams }: RouteParams) {
  return (
    <Suspense fallback={<Loading />}>
      <OrderDetailsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function OrderDetailsContent({ params }: RouteParams) {
  const { id } = await params;
  const { success, error, data: order } = await getOrder(id);
  const tryAgain = !success || error || !order;

  if (tryAgain) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="h3-semibold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-500 mt-1">View order information</p>
        </div>
        <TryAgain message={getFriendlyErrorMessage(error)} />
      </div>
    );
  }

  const calculateSubtotal = (): number => {
    return order.orderItems.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0
    );
  };

  return (
    <div className="space-y-4 pb-6 max-w-7xl">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 pb-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Order Details
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1 font-mono">
              #{order._id}
            </p>
          </div>
          <StatusSelect
            currentStatus={order.status}
            type="order"
            orderId={order._id?.toString() || ""}
          />
        </div>
      </div>

      {order.createdAt && (
        <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-blue-600 font-medium">Order Date</p>
            <p className="text-sm font-semibold text-blue-900">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Customer</h3>
        </div>
        {order.user?._id && (
          <Link
            className="flex items-center gap-3 w-fit"
            href={DASHBOARDROUTES.USERDETAILS(order.user?._id.toString())}
          >
            <UserAvatar
              user={{
                name: order?.user?.name,
                email: order?.user?.email,
                image: order?.user?.image,
                id: order?.user?._id.toString() || "",
              }}
            />
            <div>
              <p className="font-medium text-gray-900">{order?.user?.name}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {order?.user?.email}
              </p>
            </div>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">
            Order Items ({order.orderItems.length})
          </h3>
        </div>
        <div className="flex gap-3.5 overflow-auto">
          {order.orderItems.map((item, index) => (
            <Link
              href={ROUTES.PRODUCT(item.product)}
              key={`${item.variantSku}-${index}`}
              className="flex gap-3 pb-3 border p-4 rounded-lg last:border-b-0 last:pb-0"
            >
              <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={item.productImage}
                  alt={item.productTitle}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                  {item.productTitle}
                </h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.variantColor && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {item.variantColor}
                    </span>
                  )}
                  {item.variantSize && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {item.variantSize}
                    </span>
                  )}
                </div>
                <div className="flex min-w-40 items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    Quantity: {item.quantity}
                  </span>
                  <span className="font-semibold text-sm text-gray-900">
                    ${item.priceAtPurchase.toFixed(2)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Shipping Address</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Truck className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">
              {order.shippingAddress.city}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">
              {order.shippingAddress.details}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">
              {order.shippingAddress.phone}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Payment</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Method</span>
            <Badge variant="outline" className="uppercase">
              {order.payment.method}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <StatusSelect
              currentStatus={order.payment.status}
              type="payment"
              orderId={order._id?.toString() || ""}
            />
          </div>
          {order.payment.transactionId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Transaction ID</span>
              <span className="text-xs font-mono text-gray-900">
                {order.payment.transactionId}
              </span>
            </div>
          )}
        </div>
      </div>

      {order.promoCode && (
        <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-purple-900">
              Promo Code Applied
            </h3>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">Code</span>
              <span className="font-mono font-bold text-purple-900">
                {order.promoCode.code}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">Discount</span>
              <span className="font-semibold text-purple-900">
                {order.promoCode.discount}% off
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          EGP
          <h3 className="font-semibold text-gray-900">Order Summary</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">
              ${calculateSubtotal().toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">
              ${order.shippingCost.toFixed(2)}
            </span>
          </div>
          {order.promoCode && (
            <div className="flex items-center justify-between text-sm text-purple-600">
              <span>Discount ({order.promoCode.discount}%)</span>
              <span>-${order.promoCode.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t pt-2 flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg text-gray-900">
              ${order.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
