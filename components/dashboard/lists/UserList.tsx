// components/dashboard/lists/UserList.tsx
"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IUserDoc } from "@/models/user.model";
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
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { ChangeRole, deleteUser } from "@/lib/server actions/user.action";
import { changeUserRoleParams } from "@/types/global";
interface UsersListProps {
  users: IUserDoc[];
}

export function UsersList({ users }: UsersListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const columns: ColumnDef<IUserDoc>[] = [
    {
      accessorKey: "_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate max-w-37.5">
          {row.getValue("_id")}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Joined Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="text-sm">
            {date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge
            variant={role === "admin" ? "destructive" : "default"}
            className={
              role === "admin"
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }
          >
            {role}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "defaultCity",
      header: "Default City",
      cell: ({ row }) => {
        const user = row.original;
        const defaultAddress = user.addresses.find((addr) => addr.isDefault);
        return <div>{defaultAddress ? defaultAddress.city : "-"}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;

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
                      href={DASHBOARDROUTES.USERDETAILS(row.getValue("_id"))}
                    >
                      View details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      chnageRoleDelete({
                        userId: row.getValue("_id"),
                        role: user.role === "admin" ? "user" : "admin",
                      })
                    }
                  >
                    {user.role === "admin" ? "make user" : "make admin"}
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        Delete user
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the user{" "}
                          <span className="font-semibold">{user.name}</span> and
                          remove their data from the system.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 text-neutral-50"
                          onClick={() => handleDelete(row.getValue("_id"))}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        );
      },
    },
  ];

  async function handleDelete(id: string) {
    setLoading(id);
    const { error } = await deleteUser(id);
    if (error) toast.error(getFriendlyErrorMessage(error));
    setLoading(null);
  }
  async function chnageRoleDelete(params: changeUserRoleParams) {
    setLoading(params.userId);
    const { error } = await ChangeRole(params);
    if (error) toast.error(getFriendlyErrorMessage(error));
    setLoading(null);
  }

  return <DataTable columns={columns} data={users} />;
}
