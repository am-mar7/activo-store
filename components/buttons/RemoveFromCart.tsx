"use client";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import { removeFromCart } from "@/lib/server actions/cart.action";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/useCartStore";
import { Loader2, Trash } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface Props {
  productId: string;
  className?: string;
  variantSku?: string;
}

export default function RemoveFromCart({
  productId,
  className,
  variantSku,
}: Props) {
  const [isRemoving, startRemoving] = useTransition();

  const handleRemove = () => {
    startRemoving(async () => {
      const { success, error } = await removeFromCart({
        product: productId,
        sku: variantSku || undefined,
      });
      if (success) useCartStore.getState().removeItem(productId, variantSku);
      else toast.error(getFriendlyErrorMessage(error));
    });
  };

  return (
    <>
      {isRemoving && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg z-10">
          <Loader2 className="animate-spin text-blue-600 w-6 h-6" />
        </div>
      )}

      <button
        disabled={isRemoving}
        onClick={handleRemove}
        className={cn(
          className,
          "text-slate-600 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
        )}
        aria-label="Remove item"
      >
        <Trash className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </>
  );
}
