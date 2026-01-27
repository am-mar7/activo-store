"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Tag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "../DataTable";
import { CategoryPerformance } from "@/types/global";


const categoriesColumns: ColumnDef<CategoryPerformance>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;

      return (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Tag className="w-4 h-4 text-purple-600" />
          </div>
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "revenue",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Revenue
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const revenue = parseFloat(row.getValue("revenue"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(revenue);

      return <div className="font-semibold text-green-600">{formatted}</div>;
    },
  },
  {
    accessorKey: "ordersCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Orders
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const count = row.getValue("ordersCount") as number;
      return (
        <Badge variant="secondary" className="font-semibold">
          {count.toLocaleString()}
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
      return <div className="text-gray-700">{qty.toLocaleString()}</div>;
    },
  },
  {
    id: "avgOrderValue",
    header: "Avg Order Value",
    cell: ({ row }) => {
      const revenue = row.original.revenue;
      const ordersCount = row.original.ordersCount;
      const aov = ordersCount > 0 ? revenue / ordersCount : 0;

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(aov);

      return <div className="text-gray-700">{formatted}</div>;
    },
  },
];

type CategoriesPerformanceTableProps = {
  data: CategoryPerformance[];
};

export default function CategoriesPerformanceList({
  data,
}: CategoriesPerformanceTableProps) {
  const totalRevenue = data.reduce((sum, cat) => sum + cat.revenue, 0);

  const dataWithPercentage = data.map((item) => ({
    ...item,
    revenuePercentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 pb-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Category Performance</h3>
              <p className="text-sm text-gray-500 mt-1">
                Sales breakdown by product category
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4">
        {data.length === 0 ? (
          <div className="h-75 flex flex-col items-center justify-center text-gray-500">
            <Tag className="w-12 h-12 mb-2 text-gray-300" />
            <p className="font-medium">No category data available</p>
            <p className="text-sm text-gray-400">
              Start selling products to see category performance
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Gross Merchandise Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(totalRevenue)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.length}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.reduce((sum, cat) => sum + cat.soldQty, 0).toLocaleString()}
                </p>
              </div>
            </div>

            <DataTable
              columns={categoriesColumns}
              data={dataWithPercentage}
              input={{
                placeholder: "Search categories...",
                value: "name",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}