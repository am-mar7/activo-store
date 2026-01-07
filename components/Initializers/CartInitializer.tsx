'use client';

import { useEffect } from 'react';
import { useCartStore, CartItemStore } from '@/stores/useCartStore';

interface CartInitializerProps {
  cartItems: CartItemStore[];
}

export function CartInitializer({ cartItems }: CartInitializerProps) {
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      useCartStore.getState().setItems(cartItems);
    }
  }, [cartItems]);

  return null;
}