"use server";

import { cookies } from "next/headers";
import { addLine, createCart, getCart, isSampleMode, sampleCart, updateLine } from "@/lib/shopify";
import type { Cart } from "@/lib/types";

const CART_COOKIE = "cart";
const SAMPLE_COOKIE = "sample_cart";
const cookieOpts = { path: "/", httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30 };

async function readSample(): Promise<[string, number][]> {
  try {
    const raw = (await cookies()).get(SAMPLE_COOKIE)?.value;
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSample(pairs: [string, number][]): Promise<Cart> {
  const clean = pairs.filter(([, q]) => q > 0);
  (await cookies()).set(SAMPLE_COOKIE, JSON.stringify(clean), cookieOpts);
  return sampleCart(clean);
}

export async function loadCart(): Promise<Cart | null> {
  if (isSampleMode) return sampleCart(await readSample());
  const id = (await cookies()).get(CART_COOKIE)?.value;
  if (!id) return null;
  try {
    return await getCart(id);
  } catch {
    return null;
  }
}

export async function addToCart(variantId: string, quantity = 1): Promise<Cart> {
  if (isSampleMode) {
    const pairs = await readSample();
    const hit = pairs.find(([v]) => v === variantId);
    if (hit) hit[1] += quantity;
    else pairs.push([variantId, quantity]);
    return writeSample(pairs);
  }
  const jar = await cookies();
  const id = jar.get(CART_COOKIE)?.value;
  if (id) {
    try {
      return await addLine(id, variantId, quantity);
    } catch {
      // The cart expired or was checked out; start a new one below.
    }
  }
  const cart = await createCart(variantId, quantity);
  jar.set(CART_COOKIE, cart.id, cookieOpts);
  return cart;
}

export async function setLineQuantity(lineId: string, quantity: number): Promise<Cart | null> {
  if (isSampleMode) {
    const pairs = await readSample();
    const hit = pairs.find(([v]) => v === lineId);
    if (hit) hit[1] = quantity;
    return writeSample(pairs);
  }
  const id = (await cookies()).get(CART_COOKIE)?.value;
  if (!id) return null;
  return updateLine(id, lineId, quantity);
}
