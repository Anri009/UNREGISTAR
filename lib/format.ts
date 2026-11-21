import type { Money } from "./types";

export const formatPrice = (m: Money) =>
  new Intl.NumberFormat("ja-JP", { style: "currency", currency: m.currencyCode, maximumFractionDigits: 0 }).format(Number(m.amount));
