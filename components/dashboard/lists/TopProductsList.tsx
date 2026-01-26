"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, TrendingUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { DataTable } from "../DataTable";

export type TopProduct = {
  productId: string;
  title: string;
  image: string;
  soldQty: number;
  revenue: number;
};

const revenueColumns: ColumnDef<TopProduct>[] = [
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
];
const quantityColumns: ColumnDef<TopProduct>[] = [
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
      return (
        <div className="font-semibold text-blue-600">
          {qty.toLocaleString()}
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

      return <div className="text-gray-700">{formatted}</div>;
    },
  },
];
type TopProductsTableProps = {
  data: {
    byRevenue: TopProduct[];
    byQuantity: TopProduct[];
  };
};

export default function TopProductsList({ data }: TopProductsTableProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white  rounded-lg border border-gray-200  shadow-sm">
        <div className="flex items-center gap-2 p-6 pb-4 border-b border-gray-200 ">
          <div className="p-2 bg-green-100  rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-600 " />
          </div>
          <h3 className="text-lg font-semibold">Top Products by Revenue</h3>
        </div>
        <div className="p-6 pt-4">
          {data.byRevenue.length === 0 ? (
            <div className="h-75 flex flex-col items-center justify-center text-gray-500">
              <Package className="w-12 h-12 mb-2 text-gray-300" />
              <p>No product data available</p>
            </div>
          ) : (
            <DataTable
              columns={revenueColumns}
              data={data.byRevenue}
              input={{
                placeholder: "Search products...",
                value: "title",
              }}
            />
          )}
        </div>
      </div>

      {/* Top Products by Quantity */}
      <div className="bg-white  rounded-lg border border-gray-200  shadow-sm">
        <div className="flex items-center gap-2 p-6 pb-4 border-b border-gray-200 ">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Package className="w-4 h-4 text-blue-600 " />
          </div>
          <h3 className="text-lg font-semibold">Top Products by Quantity</h3>
        </div>
        <div className="p-6 pt-4">
          {data.byQuantity.length === 0 ? (
            <div className="h-75 flex flex-col items-center justify-center text-gray-500">
              <Package className="w-12 h-12 mb-2 text-gray-300" />
              <p>No product data available</p>
            </div>
          ) : (
            <DataTable
              columns={quantityColumns}
              data={data.byQuantity}
              input={{
                placeholder: "Search products...",
                value: "title",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Usage in your page.tsx
/*
import TopProductsTable from "@/components/TopProductsTable";

async function TopProducts({ to, from, preset }: PageProps) {
  const { success, error, data } = await getTopProducts({
    from,
    to,
    preset,
  });

  if (!success || error || !data) {
    return <TryAgain message={getFriendlyErrorMessage(error)} />;
  }

  return <TopProductsTable data={data} />;
}

// In your main component
<Suspense fallback={<Loading />}>
  <TopProducts to={to} from={from} preset={validPreset} />
</Suspense>
*/
