import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  setItems: (items: string[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items: string[]) => set({ items }),

      addToWishlist: (productId) =>
        set((state) => ({
          items: [...state.items, productId],
        })),

      removeFromWishlist: (productId) =>
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        })),

      isInWishlist: (productId) => get().items.includes(productId),

      toggleWishlist: (productId) =>
        set((state) => {
          const isInList = state.items.includes(productId);
          return {
            items: isInList
              ? state.items.filter((id) => id !== productId)
              : [...state.items, productId],
          };
        }),
    }),
    {
      name: "wishlist-storage",
    }
  )
);
