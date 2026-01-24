"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "../DataTable";
import { IAddress } from "@/models/user.model";

interface AddressesListProps {
  addresses: IAddress[];
}

export function AddressesList({ addresses }: AddressesListProps) {
  const columns: ColumnDef<IAddress>[] = [
    {
      accessorKey: "city",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            City
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("city")}</div>,
    },
    {
      accessorKey: "details",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            details
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("details")}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    },
    {
      accessorKey: "isDefault",
      header: "Status",
      cell: ({ row }) => {
        const isDefault = row.getValue("isDefault") as boolean;
        return (
          <Badge
            variant={isDefault ? "default" : "secondary"}
            className={
              isDefault
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          >
            {isDefault ? "Default" : "Secondary"}
          </Badge>
        );
      },
    },
  ];

  return (
    <DataTable
      input={{ placeholder: "Filter by city...", value: "city" }}
      columns={columns}
      data={addresses}
    />
  );
}
