import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItemStore {
  product: string; // id
  variantSku: string;
  quantity: number;
}

interface CartStore {
  items: CartItemStore[];

  addItem: (
    item: Omit<CartItemStore, "quantity"> & { quantity?: number }
  ) => void;
  removeItem: (product: string, variantSku: string) => void;
  updateQuantity: (
    product: string,
    variantSku: string,
    quantity: number
  ) => void;
  clearCart: () => void;

  isInCart: (product: string, variantSku: string) => boolean;
  getItem: (product: string, variantSku: string) => CartItemStore | undefined;
  getItemCount: () => number;
  setItems: (items: CartItemStore[]) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.product === item.product && i.variantSku === item.variantSku
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.product === item.product && i.variantSku === item.variantSku
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
          };
        }),

      removeItem: (product, variantSku) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.product === product && item.variantSku === variantSku)
          ),
        })),

      updateQuantity: (product, variantSku, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (item) =>
                  !(item.product === product && item.variantSku === variantSku)
              ),
            };
          }

          return {
            items: state.items.map((item) =>
              item.product === product && item.variantSku === variantSku
                ? { ...item, quantity }
                : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      isInCart: (product, variantSku) => {
        return get().items.some(
          (item) => item.product === product && item.variantSku === variantSku
        );
      },

      getItem: (product, variantSku) => {
        return get().items.find(
          (item) => item.product === product && item.variantSku === variantSku
        );
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      setItems: (items) => set({ items }),
    }),
    {
      name: "cart-storage",
    }
  )
);
