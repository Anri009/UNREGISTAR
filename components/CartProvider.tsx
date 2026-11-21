"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { addToCart, setLineQuantity } from "@/app/actions";
import type { Cart } from "@/lib/types";

type Ctx = {
  cart: Cart | null;
  open: boolean;
  pending: boolean;
  error: string | null;
  setOpen: (o: boolean) => void;
  add: (variantId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
};

const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ initialCart, children }: { initialCart: Cart | null; children: ReactNode }) {
  const [cart, setCart] = useState(initialCart);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<Cart | null>, openAfter = false) =>
    start(async () => {
      setError(null);
      try {
        setCart(await fn());
        if (openAfter) setOpen(true);
      } catch {
        setError("カートを更新できませんでした。時間をおいてもう一度お試しください。");
      }
    });

  return (
    <CartContext.Provider
      value={{
        cart,
        open,
        pending,
        error,
        setOpen,
        add: (variantId) => run(() => addToCart(variantId), true),
        setQuantity: (lineId, quantity) => run(() => setLineQuantity(lineId, quantity)),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
