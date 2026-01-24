"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, LucideIcon, Package, CreditCard } from "lucide-react";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { toast } from "sonner";
import {
  UpdateOrderStatus,
  upatePaymentStatus,
} from "@/lib/server actions/order.action";
import { OrderType } from "@/types/global";

type OrderStatus = OrderType["status"];
type PaymentStatus = OrderType["payment"]["status"];
type Status = OrderStatus | PaymentStatus;

type StatusColors = {
  [K in Status]?: string;
};

interface StatusSelectProps {
  currentStatus: Status;
  type: "order" | "payment";
  orderId: string;
  icon?: LucideIcon;
  label?: string;
}

const defaultStatusColors: StatusColors = {
  pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  delivering: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  delivered: "bg-green-100 text-green-700 hover:bg-green-200",
  cancelled: "bg-red-100 text-red-700 hover:bg-red-200",
  completed: "bg-green-100 text-green-700 hover:bg-green-200",
  failed: "bg-red-100 text-red-700 hover:bg-red-200",
  refunded: "bg-gray-100 text-gray-700 hover:bg-gray-200",
};

const defaultStatusDotColors: StatusColors = {
  pending: "bg-yellow-500",
  delivering: "bg-blue-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
  refunded: "bg-gray-500",
};

export function StatusSelect({
  currentStatus,
  type,
  orderId,
  icon,
  label,
}: StatusSelectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>(currentStatus);

  const Icon = icon || (type === "order" ? Package : CreditCard);

  const handleStatusChange = async (newStatus: Status) => {
    if (newStatus === status) return;
    setIsLoading(true);

    const { error } =
      type === "order"
        ? await UpdateOrderStatus({ orderId, status: newStatus as OrderStatus })
        : await upatePaymentStatus({
            orderId,
            status: newStatus as PaymentStatus,
          });

    if (error) {
      toast.error(getFriendlyErrorMessage(error));
    } else {
      setStatus(newStatus);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Badge className="bg-gray-100 text-gray-700 gap-2 min-w-30 justify-center">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Updating...</span>
      </Badge>
    );
  }

  const statusOptions =
    type === "order"
      ? ["pending", "delivering", "delivered", "cancelled"]
      : ["pending", "completed", "failed", "refunded"];

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
      disabled={isLoading}
    >
      <SelectTrigger
        className={`w-auto border-0 ${defaultStatusColors[status]} font-medium gap-2`}
      >
        <Icon className="w-3 h-3" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-neutral-50 mt-12">
        {label && (
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
            {label}
          </div>
        )}
        {statusOptions.map((option) => (
          <SelectItem key={option} value={option}>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${defaultStatusDotColors[option as Status]}`}
              />
              <span className="capitalize">{option}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
