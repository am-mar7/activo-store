import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItemStore {
  product: string;
  variantSku?: string;
  quantity: number;
}

interface CartStore {
  items: CartItemStore[];

  addItem: (
    item: Omit<CartItemStore, "quantity"> & { quantity?: number }
  ) => void;
  removeItem: (product: string, variantSku?: string) => void;
  updateQuantity: (
    product: string,
    variantSku: string | undefined,
    quantity: number
  ) => void;
  clearCart: () => void;

  isInCart: (product: string, variantSku?: string) => boolean;
  getItem: (product: string, variantSku?: string) => CartItemStore | undefined;
  getItemCount: () => number;
  setItems: (items: CartItemStore[]) => void;
}

const matchItem =
  (product: string, variantSku?: string) =>
  (i: CartItemStore): boolean =>
    i.product === product && i.variantSku === variantSku;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const isMatch = matchItem(item.product, item.variantSku);
          const existingItem = state.items.find(isMatch);

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                isMatch(i)
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
          items: state.items.filter((i) => !matchItem(product, variantSku)(i)),
        })),

      updateQuantity: (product, variantSku, quantity) =>
        set((state) => {
          const isMatch = matchItem(product, variantSku);

          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => !isMatch(i)),
            };
          }

          return {
            items: state.items.map((i) =>
              isMatch(i) ? { ...i, quantity } : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      isInCart: (product, variantSku) =>
        get().items.some(matchItem(product, variantSku)),

      getItem: (product, variantSku) =>
        get().items.find(matchItem(product, variantSku)),

      getItemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      setItems: (items) => set({ items }),
    }),
    {
      name: "cart-storage",
    }
  )
);