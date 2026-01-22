"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2, MoreHorizontal, Copy, Check } from "lucide-react";
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

import { deletePromoCode } from "@/lib/server actions/promocode.action";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { useState } from "react";
import { PromoCodeType } from "@/types/global";

interface PromoCodesListProps {
  promoCodes: PromoCodeType[];
}

export function PromoCodesList({ promoCodes }: PromoCodesListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const getPromoStatus = (promo: PromoCodeType) => {
    const now = new Date();
    
    if (promo.expiredAt && new Date(promo.expiredAt) <= now) {
      return "expired";
    }
    
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return "limitReached";
    }
    
    return "active";
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedCode(null), 2000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const columns: ColumnDef<PromoCodeType>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => {
        const code = row.getValue("code") as string;
        const isCopied = copiedCode === code;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-primary">
              {code}
            </span>
            <button
              onClick={() => copyToClipboard(code)}
              className="text-muted-foreground hover:text-primary transition-colors"
              title="Copy code"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "percentage",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Discount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const percentage = row.getValue("percentage") as number;
        return (
          <div className="font-semibold text-green-600">
            {percentage}%
          </div>
        );
      },
    },
    {
      accessorKey: "maxDiscount",
      header: "Max Discount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("maxDiscount"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "EGP",
        }).format(amount);
        return <div className="text-sm">{formatted}</div>;
      },
    },
    {
      accessorKey: "minPurchase",
      header: "Min Purchase",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("minPurchase"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "EGP",
        }).format(amount);
        return <div className="text-sm">{formatted}</div>;
      },
    },
    {
      id: "usage",
      header: "Usage",
      cell: ({ row }) => {
        const usageCount = row.original.usageCount;
        const usageLimit = row.original.usageLimit;
        
        return (
          <div className="text-sm">
            <span className="font-medium">{usageCount}</span>
            {usageLimit ? (
              <span className="text-muted-foreground"> / {usageLimit}</span>
            ) : (
              <span className="text-muted-foreground"> / ∞</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "expiredAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Expiry Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const expiredAt = row.getValue("expiredAt") as Date | undefined;
        
        if (!expiredAt) {
          return <div className="text-sm text-muted-foreground">No expiry</div>;
        }
        
        const date = new Date(expiredAt);
        const isExpired = date <= new Date();
        
        return (
          <div className={`text-sm ${isExpired ? "text-red-600" : ""}`}>
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
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = getPromoStatus(row.original);
        const statusConfig = {
          active: {
            label: "Active",
            className: "bg-green-100 text-green-700 hover:bg-green-200",
          },
          expired: {
            label: "Expired",
            className: "bg-red-100 text-red-700 hover:bg-red-200",
          },
          limitReached: {
            label: "Limit Reached",
            className: "bg-orange-100 text-orange-700 hover:bg-orange-200",
          },
        };

        const config = statusConfig[status];
        
        return (
          <Badge className={config.className}>
            {config.label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        const status = getPromoStatus(row.original);
        return value.includes(status);
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
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="text-sm text-muted-foreground">
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const promoId = row.original._id.toString();
        
        return (
          <>
            {loading === promoId ? (
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
                  
                  <DropdownMenuItem onClick={() => copyToClipboard(row.original.code)}>
                    Copy code
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem>
                    <Link href={DASHBOARDROUTES.EDITPROMOCODE(promoId)}>
                      Edit promo code
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => handleDeletePromoCode(promoId)}
                  >
                    Delete promo code
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        );
      },
    },
  ];

  async function handleDeletePromoCode(id: string) {
    const confirmed = confirm(
      "Are you sure you want to delete this promo code? This action cannot be undone."
    );
    
    if (!confirmed) return;
    
    setLoading(id);
    const { error } = await deletePromoCode(id);

    if (error) {
      toast.error(getFriendlyErrorMessage(error));
    } else {
      toast.success("Promo code deleted successfully");
    }
    
    setLoading(null);
  }

  return (
    <DataTable
      input={{ placeholder: "Search by code", value: "code" }}
      columns={columns}
      data={promoCodes}
    />
  );
}