"use client";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { upsertCartItem } from "@/lib/server actions/cart.action";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/useCartStore";
import { Loader2, Minus, Plus } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  productId: string;
  className?: string;
  variantSku: string;
  initialQuantity: number;
}

export default function QuantiityController({
  productId,
  className,
  variantSku,
  initialQuantity,
}: Props) {
  const [isUpdating, startUpdating] = useTransition();
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    if (quantity !== initialQuantity) {
      const debounceTimer = setTimeout(() => {
        startUpdating(async () => {
          const { success, error } = await upsertCartItem({
            type: "update",
            product: productId,
            sku: variantSku,
            quantity,
          });
          if (success)
            useCartStore
              .getState()
              .updateQuantity(productId, variantSku, quantity);
          else toast.error(getFriendlyErrorMessage(error));
        });
      }, 1500);
      return () => clearTimeout(debounceTimer);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity]);

  return (
    <>
      {isUpdating && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg z-10">
          <Loader2 className="animate-spin text-blue-600 w-6 h-6" />
        </div>
      )}

      <div
        className={cn(
          className,
          "flex items-center gap-1.5 xs:gap-2.5 rounded-lg"
        )}
      >
        <button
          disabled={isUpdating || quantity <= 1}
          onClick={() => setQuantity(quantity - 1)}
          className="w-5 h-5 flex items-center justify-center bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <span className="small-semibold text-center font-semibold text-slate-900">
          {quantity}
        </span>

        <button
          disabled={isUpdating}
          onClick={() => setQuantity(quantity + 1)}
          className="w-5 h-5 flex items-center justify-center bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-full transition-all disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
}
