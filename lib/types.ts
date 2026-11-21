export type Money = { amount: string; currencyCode: string };

export type Image = { url: string; altText: string | null; width?: number; height?: number };

export type ProductSummary = {
  handle: string;
  title: string;
  price: Money;
  image: Image | null;
  /** Sample mode only: leather colour used for the placeholder drawing. */
  swatch?: string;
};

export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  selectedOptions: { name: string; value: string }[];
  image: Image | null;
};

export type Product = ProductSummary & {
  descriptionHtml: string;
  images: Image[];
  options: { name: string; values: string[] }[];
  variants: Variant[];
};

export type CartLine = {
  id: string;
  quantity: number;
  variantId: string;
  productTitle: string;
  variantTitle: string;
  handle: string;
  image: Image | null;
  price: Money;
  swatch?: string;
};

export type Cart = {
  id: string;
  /** Shopify checkout page. null in sample mode. */
  checkoutUrl: string | null;
  totalQuantity: number;
  subtotal: Money;
  lines: CartLine[];
};

export type TextPage = { title: string; body: string };
