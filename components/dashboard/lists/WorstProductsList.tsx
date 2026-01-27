"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { DataTable } from "../DataTable";
import { WorstProduct } from "@/types/global";



const worstProductsColumns: ColumnDef<WorstProduct>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const image = row.original.image;

      return (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 shrink-0">
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <span className="font-medium text-sm line-clamp-2">{title}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "wishlistCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Wishlisted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const count = row.getValue("wishlistCount") as number;
      return (
        <Badge variant="secondary" className="font-semibold">
          {count.toLocaleString()} times
        </Badge>
      );
    },
  },
  {
    accessorKey: "soldQty",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Units Sold
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const qty = row.getValue("soldQty") as number;
      const wishlistCount = row.original.wishlistCount;

      // Calculate conversion rate
      const conversionRate =
        wishlistCount > 0
          ? ((qty / wishlistCount) * 100).toFixed(1)
          : "0.0";

      return (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-red-600">
            {qty.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500">
            {conversionRate}% conversion
          </span>
        </div>
      );
    },
  },
  {
    id: "issue",
    header: "Issue Severity",
    cell: ({ row }) => {
      const soldQty = row.original.soldQty;
      const wishlistCount = row.original.wishlistCount;

      // Calculate severity based on wishlist vs sales ratio
      const ratio = wishlistCount / (soldQty || 1);

      let label: string;
      let bgColor: string;

      if (soldQty === 0) {
        label = "Critical";
        bgColor = "bg-red-100 text-red-700";
      } else if (ratio >= 10) {
        label = "Critical";
        bgColor = "bg-red-100 text-red-700";
      } else if (ratio >= 5) {
        label = "High";
        bgColor = "bg-orange-100 text-orange-700";
      } else {
        label = "Medium";
        bgColor = "bg-yellow-100 text-yellow-700";
      }

      return <Badge className={`${bgColor} border-0`}>{label}</Badge>;
    },
  },
];

type WorstProductsTableProps = {
  data: WorstProduct[];
};

export default function WorstProductsList({ data }: WorstProductsTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 pb-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                High Interest, Low Sales
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Products with 5+ wishlists but poor sales performance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4">
        {data.length === 0 ? (
          <div className="h-75 flex flex-col items-center justify-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mb-2 text-gray-300" />
            <p className="font-medium">Great news!</p>
            <p className="text-sm text-gray-400">
              No underperforming products found
            </p>
          </div>
        ) : (
          <>
            {/* Alert Banner */}
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900">
                    Action Required
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    These products have high customer interest but poor
                    conversion. Consider reviewing pricing, descriptions, stock
                    availability, or product quality.
                  </p>
                </div>
              </div>
            </div>

            <DataTable
              columns={worstProductsColumns}
              data={data}
              input={{
                placeholder: "Search products...",
                value: "title",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}