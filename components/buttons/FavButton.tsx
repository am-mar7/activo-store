"use client";
import { getFriendlyErrorMessage } from "@/lib/error-messages";
import {
  addProductToWishlist,
  deleteProductFromWishlist,
} from "@/lib/server actions/wishlist.action";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/stores/useWishlistStore";
import { Heart, Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  className?: string;
  product: string;
}

export default function FavButton({ className, product }: Props) {
  const [isFav, setIsFav] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggleFavorite = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const Fn = isFav ? deleteProductFromWishlist : addProductToWishlist;
    startTransition(async () => {
      const { success, error } = await Fn(product);
      if (success) {
        useWishlistStore.getState().toggleWishlist(product);
        setIsFav(!isFav);
      } else {
        toast.error(getFriendlyErrorMessage(error));
      }
    });
  };

  useEffect(() => {
    const isFavorite = useWishlistStore.getState().isInWishlist(product);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFav(isFavorite);
  }, [product]);

  return (
    <div className={cn(className)}>
      <button onClick={handleToggleFavorite}>
        {isPending ? (
          <Loader2 className="w-7 h-7 animate-spin text-slate-700" />
        ) : (
          <Heart
            fill={isFav ? "red" : "none"}
            className={`w-7 h-7  ${isFav ? "text-red-500" : "text-slate-700"}`}
          />
        )}
      </button>
    </div>
  );
}
