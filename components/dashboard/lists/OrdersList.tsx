// components/dashboard/lists/OrdersList.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "../DataTable";
import Link from "next/link";
import { DASHBOARDROUTES } from "@/constants/routes";
import { OrderDetailedType } from "@/types/global";
import { UpdateOrderStatus } from "@/lib/server actions/order.action";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { useState } from "react";

interface OrdersListProps {
  orders: OrderDetailedType[];
}

export function OrdersList({ orders }: OrdersListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const availableStatuses: ["pending", "delivering", "delivered"] = [
    "pending",
    "delivering",
    "delivered",
  ];
  const columns: ColumnDef<OrderDetailedType>[] = [
    {
      accessorFn: (row) => `${row.user.name} ${row.user.email}`,
      id: "customer-search",
      header: () => null,
      cell: () => null,
      enableHiding: false,
      enableSorting: false,
    },
    {
      accessorKey: "_id",
      header: "Order ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate max-w-30">
          #{row.getValue("_id")}
        </div>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Order Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="text-sm">
            {date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusColors = {
          pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
          delivering: "bg-blue-100 text-blue-700 hover:bg-blue-200",
          delivered: "bg-green-100 text-green-700 hover:bg-green-200",
          cancelled: "bg-red-100 text-red-700 hover:bg-red-200",
        };

        return (
          <Badge className={statusColors[status as keyof typeof statusColors]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "totalPrice",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalPrice"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "payment",
      header: "Payment",
      cell: ({ row }) => {
        const payment = row.original.payment;
        return <div className="text-sm capitalize">{payment.method}</div>;
      },
    },
    {
      id: "shippingCity",
      header: "City",
      cell: ({ row }) => {
        const city = row.original.shippingAddress.city;
        return <div className="text-sm">{city}</div>;
      },
    },
    {
      id: "itemsCount",
      header: "Items",
      cell: ({ row }) => {
        const count = row.original.orderItems.length;
        return <div className="text-sm text-center">{count}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <>
            {loading === row.getValue("_id") ? (
              <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-neutral-50" align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link
                      href={DASHBOARDROUTES.ORDERDETAILS(row.getValue("_id"))}
                    >
                      View details
                    </Link>
                  </DropdownMenuItem>
                  {row.getValue("status") !== "cancelled" && (
                    <>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Update Status
                      </DropdownMenuLabel>
                      {availableStatuses
                        .filter((status) => status !== row.getValue("status"))
                        .map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() =>
                              handleUpdateOrder(row.getValue("_id"), status)
                            }
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </DropdownMenuItem>
                        ))}
                    </>
                  )}

                  <DropdownMenuItem
                    onClick={() =>
                      toggleOrderStatus(
                        row.getValue("_id"),
                        row.getValue("status")
                      )
                    }
                  >
                    {row.getValue("status") === "cancelled" ? (
                      <span className="text-green-600">Revive Order</span>
                    ) : (
                      <span className="text-red-600">Cancel order</span>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        );
      },
    },
  ];

  async function handleUpdateOrder(
    id: string,
    status: "cancelled" | "delivering" | "delivered" | "pending"
  ) {
    setLoading(id);
    const { error } = await UpdateOrderStatus({
      orderId: id,
      status,
    });
    console.log("error", error);

    if (error) toast.error(getFriendlyErrorMessage(error));
    setLoading(null);
  }

  async function toggleOrderStatus(
    id: string,
    status: "cancelled" | "delivering" | "delivered" | "pending"
  ) {
    const newStatus = status === "cancelled" ? "pending" : "cancelled";
    await handleUpdateOrder(id, newStatus);
  }

  return (
    <DataTable
      input={{ placeholder: "filter by customer", value: "customer-search" }}
      columns={columns}
      data={orders}
    />
  );
}
