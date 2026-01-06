"use client";
import { useEffect } from "react";
import { useWishlistStore } from "@/stores/useWishlistStore";

export function WishlistInitializer({
  wishlistIds,
}: {
  wishlistIds: string[];
}) {
  useEffect(() => {
    useWishlistStore.getState().setItems(wishlistIds);
    console.log("wishlist ids setted", wishlistIds);
  }, [wishlistIds]);

  return null;
}
