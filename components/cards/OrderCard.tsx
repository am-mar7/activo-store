"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Calendar,
  Package,
  Tag,
  ShoppingCart,
  MapPin,
  Home,
  Building2,
  Phone,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { OrderType } from "@/types/global";
import CancelOrderBtn from "../buttons/CancelOrderBtn";

interface OrderCardProps {
  order: OrderType;
  index: number;
}

export function OrderCard({ order, index }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const createdAt = order.createdAt || "";
  const status = order.status || "pending";
  const items = order.orderItems || [];
  const total = order.totalPrice || 0;
  const shippingCost = order.shippingCost || 0;
  const promoCode = order.promoCode;
  const shippingAddress = order.shippingAddress;
  const payment = order.payment;

  const itemsSubtotal = items.reduce((sum, item) => {
    return sum + (item.subTotal || item.priceAtPurchase * item.quantity);
  }, 0);
  const discountAmount = promoCode?.discount || 0;
  console.log("index", index, order);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700 border border-green-200";
      case "delivering":
        return "bg-purple-100 text-purple-700 border border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border border-red-200";
      case "pending":
      default:
        return "bg-amber-100 text-amber-700 border border-amber-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US").format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl w-full shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-slate-200"
    >
      <div className="bg-linear-to-r  from-neutral-100 to-neutral-200 px-4 sm:px-6 py-2 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-neutral-700 rounded-lg px-3 py-2 font-bold body-regular">
              #{index + 1}
            </div>
            <div>
              <div className="text-xs text-secondary flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(createdAt)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm capitalize font-semibold ${getStatusStyle(
                status
              )}`}
            >
              {status}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
          <div className="bg-slate-50 rounded-lg p-2 border flex-center gap-2 border-slate-200">
            <div className="small-medium text-secondary uppercase tracking-wide ">
              {items.length === 1 ? "One Item" : `${items.length} Items`}
            </div>
            <div className="body-bold font-bold text-primary flex items-center gap-2">
              <Package className="w-5 h-5 text-secondary" />
            </div>
          </div>

          <div className="bg-blue-50 flex-center gap-2 rounded-lg p-2 border border-blue-200">
            <div className="small-medium text-blue-600 uppercase tracking-wide">
              Subtotal
            </div>
            <div className="body-bold text-primary-gradient">
              {formatCurrency(itemsSubtotal)} EGP
            </div>
          </div>

          <div className="bg-green-50 flex-center gap-2 rounded-lg p-2 border border-green-200">
            <div className="small-medium text-green-600 uppercase tracking-wide">
              Total
            </div>
            <div className="body-bold font-bold text-green-900">
              {formatCurrency(total)} EGP
            </div>
          </div>
        </div>

        {promoCode && discountAmount > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">
                Discount ({promoCode.code})
              </span>
            </div>
            <span className="body-regular font-bold text-orange-700">
              -{formatCurrency(discountAmount)} EGP
            </span>
          </div>
        )}

        {!isExpanded && items.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-100 overflow-x-auto px-2 py-1 rounded-sm">
            {items.slice(0, 4).map((item, idx) => (
              <div
                key={item.variantSku ?? 0 + idx}
                className="shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 border-slate-200"
              >
                <Image
                  width={600}
                  height={600}
                  src={item.productImage || "/placeholder.png"}
                  alt={item.productTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {items.length > 4 && (
              <div className="shrink-0 w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center text-secondary font-semibold">
                +{items.length - 4}
              </div>
            )}
          </div>
        )}

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-200 pt-6 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Items List */}
                  <div className="lg:col-span-2 space-y-3">
                    <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Order Items
                    </h3>
                    {items.map((item, idx) => (
                      <motion.div
                        key={item.variantSku ?? 0 + idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex gap-4">
                          <Image
                            width={600}
                            height={600}
                            src={item.productImage || "/placeholder.png"}
                            alt={item.productTitle}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-white shadow-sm"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-primary mb-1">
                              {item.productTitle}
                            </div>
                            {(item.variantColor || item.variantSize) && (
                              <div className="text-xs text-secondary mb-1">
                                {item.variantColor && (
                                  <span>{item.variantColor}</span>
                                )}
                                {item.variantColor && item.variantSize && (
                                  <span> • </span>
                                )}
                                {item.variantSize && (
                                  <span>{item.variantSize}</span>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-secondary">
                                <span className="font-semibold">
                                  {item.quantity}
                                </span>
                              </span>
                              <span className="text-accent">×</span>
                              <span className="text-secondary">
                                {formatCurrency(item.priceAtPurchase)} EGP
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right sm:text-left">
                          <div className="text-sm text-secondary mb-1">
                            Item Total
                          </div>
                          <div className="body-regular font-bold text-primary">
                            {formatCurrency(
                              item.subTotal ||
                                item.quantity * item.priceAtPurchase
                            )}{" "}
                            EGP
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Order Details Sidebar */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-4"
                  >
                    {/* Shipping Address */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-secondary" />
                        Shipping Address
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <Building2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                          <span className="text-secondary capitalize">
                            {shippingAddress.city || "-"}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Home className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                          <span className="text-secondary">
                            {shippingAddress.details || "-"}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                          <span className="text-secondary font-mono">
                            {shippingAddress.phone || "-"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <h4 className="font-semibold text-primary mb-3 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Payment Method
                      </h4>
                      <div className="space-y-1">
                        <div className="text-sm text-primary capitalize font-medium">
                          {payment.method === "COD"
                            ? "Cash on Delivery"
                            : payment.method}
                        </div>
                        <div className="text-xs text-secondary capitalize">
                          Status: {payment.status}
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                      <h4 className="font-semibold text-primary mb-3">
                        Price Breakdown
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-secondary">
                          <span>Subtotal</span>
                          <span className="font-medium">
                            {formatCurrency(itemsSubtotal)} EGP
                          </span>
                        </div>
                        <div className="flex justify-between text-secondary">
                          <span>Shipping</span>
                          <span className="font-medium">
                            {formatCurrency(shippingCost)} EGP
                          </span>
                        </div>
                        {promoCode && discountAmount > 0 && (
                          <div className="flex justify-between text-orange-600">
                            <span>Discount</span>
                            <span className="font-medium">
                              -{formatCurrency(discountAmount)} EGP
                            </span>
                          </div>
                        )}
                        <div className="border-t border-slate-300 pt-2 flex justify-between text-primary font-bold text-base">
                          <span>Total</span>
                          <span>{formatCurrency(total)} EGP</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 flex flex-col sm:flex-row justify-center items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full body-medium sm:w-auto px-5 py-2.5 rounded-xl btn-primary text-white transition-all duration-300 flex-center gap-2 shadow-md hover:shadow-lg"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-5 h-5" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                View Details
              </>
            )}
          </button>

          {status === "pending" && isExpanded && order._id && (
            <CancelOrderBtn id={order._id} />
          )}
        </div>
      </div>
    </motion.div>
  );
}
