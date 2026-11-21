// Storefront API client. Every product, price, image and stock level comes from
// Shopify, so adding a product in the Shopify admin needs no code change.
// When the env vars are missing, the site runs on lib/sample.ts instead.
import "server-only";
import { sampleProducts, sampleSwatch } from "./sample";
import type { Cart, CartLine, Image, Money, Product, ProductSummary, TextPage, Variant } from "./types";

const domain = process.env.SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const token = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || "2025-10";

export const isSampleMode = !domain || !token || domain === "your-store.myshopify.com";

async function storefront<T>(query: string, variables: Record<string, unknown> = {}, cache: RequestCache = "force-cache"): Promise<T> {
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token! },
    body: JSON.stringify({ query, variables }),
    cache,
    next: cache === "force-cache" ? { revalidate: 60, tags: ["shopify"] } : undefined,
  });
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (!res.ok || json.errors?.length) {
    throw new Error(`Shopify Storefront API: ${json.errors?.map((e) => e.message).join("; ") || res.status}`);
  }
  return json.data as T;
}

const ctx = "@inContext(country: JP, language: JA)";
const IMAGE = "url altText width height";
const MONEY = "amount currencyCode";

type RawSummary = { handle: string; title: string; featuredImage: Image | null; priceRange: { minVariantPrice: Money } };
const toSummary = (p: RawSummary): ProductSummary => ({
  handle: p.handle,
  title: p.title,
  price: p.priceRange.minVariantPrice,
  image: p.featuredImage,
});

/** All products, newest first. Follows pagination, so any number of products works. */
export async function getProducts(): Promise<ProductSummary[]> {
  if (isSampleMode) return sampleProducts;
  const out: ProductSummary[] = [];
  let after: string | null = null;
  do {
    const data: {
      products: { nodes: RawSummary[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };
    } = await storefront(
      `query Products($after: String) ${ctx} {
        products(first: 100, after: $after, sortKey: CREATED_AT, reverse: true) {
          nodes { handle title featuredImage { ${IMAGE} } priceRange { minVariantPrice { ${MONEY} } } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { after },
    );
    out.push(...data.products.nodes.map(toSummary));
    after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (after);
  return out;
}

export async function getProduct(handle: string): Promise<Product | null> {
  if (isSampleMode) return sampleProducts.find((p) => p.handle === handle) ?? null;
  const data = await storefront<{
    product:
      | (RawSummary & {
          descriptionHtml: string;
          images: { nodes: Image[] };
          options: { name: string; optionValues: { name: string }[] }[];
          variants: { nodes: Variant[] };
        })
      | null;
  }>(
    `query Product($handle: String!) ${ctx} {
      product(handle: $handle) {
        handle title descriptionHtml
        featuredImage { ${IMAGE} }
        priceRange { minVariantPrice { ${MONEY} } }
        images(first: 20) { nodes { ${IMAGE} } }
        options { name optionValues { name } }
        variants(first: 100) {
          nodes { id title availableForSale price { ${MONEY} } selectedOptions { name value } image { ${IMAGE} } }
        }
      }
    }`,
    { handle },
  );
  const p = data.product;
  if (!p) return null;
  return {
    ...toSummary(p),
    descriptionHtml: p.descriptionHtml,
    images: p.images.nodes,
    options: p.options.map((o) => ({ name: o.name, values: o.optionValues.map((v) => v.name) })),
    variants: p.variants.nodes,
  };
}

/** A page made in Shopify admin (Online Store > Pages), e.g. 特定商取引法に基づく表記. */
export async function getPage(handle: string): Promise<TextPage | null> {
  if (isSampleMode) return null;
  const data = await storefront<{ page: TextPage | null }>(
    `query Page($handle: String!) ${ctx} { page(handle: $handle) { title body } }`,
    { handle },
  );
  return data.page;
}

const POLICY_FIELDS = { privacy: "privacyPolicy", shipping: "shippingPolicy", refund: "refundPolicy", terms: "termsOfService" } as const;
export type PolicyHandle = keyof typeof POLICY_FIELDS;
export const isPolicyHandle = (h: string): h is PolicyHandle => h in POLICY_FIELDS;

/** A policy written in Shopify admin (Settings > Policies). */
export async function getPolicy(handle: PolicyHandle): Promise<TextPage | null> {
  if (isSampleMode) return null;
  const field = POLICY_FIELDS[handle];
  const data = await storefront<{ shop: Record<string, TextPage | null> }>(
    `query Policy ${ctx} { shop { ${field} { title body } } }`,
  );
  return data.shop[field];
}

// ---------- Cart ----------

const CART = `
  id checkoutUrl totalQuantity
  cost { subtotalAmount { ${MONEY} } }
  lines(first: 100) { nodes {
    id quantity
    merchandise { ... on ProductVariant { id title image { ${IMAGE} } price { ${MONEY} } product { title handle featuredImage { ${IMAGE} } } } }
  } }`;

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: { id: string; title: string; image: Image | null; price: Money; product: { title: string; handle: string; featuredImage: Image | null } };
    }[];
  };
};

const toCart = (c: RawCart): Cart => ({
  id: c.id,
  checkoutUrl: c.checkoutUrl,
  totalQuantity: c.totalQuantity,
  subtotal: c.cost.subtotalAmount,
  lines: c.lines.nodes.map(
    (l): CartLine => ({
      id: l.id,
      quantity: l.quantity,
      variantId: l.merchandise.id,
      productTitle: l.merchandise.product.title,
      variantTitle: l.merchandise.title,
      handle: l.merchandise.product.handle,
      image: l.merchandise.image ?? l.merchandise.product.featuredImage,
      price: l.merchandise.price,
    }),
  ),
});

type Mutation = { cart: RawCart | null; userErrors: { message: string }[] };
const unwrap = (m: Mutation): Cart => {
  if (m.userErrors.length || !m.cart) throw new Error(m.userErrors.map((e) => e.message).join("; ") || "Cart error");
  return toCart(m.cart);
};

export async function getCart(id: string): Promise<Cart | null> {
  const data = await storefront<{ cart: RawCart | null }>(`query Cart($id: ID!) ${ctx} { cart(id: $id) { ${CART} } }`, { id }, "no-store");
  return data.cart ? toCart(data.cart) : null;
}

export async function createCart(variantId: string, quantity: number): Promise<Cart> {
  const data = await storefront<{ cartCreate: Mutation }>(
    `mutation Create($lines: [CartLineInput!]) ${ctx} {
      cartCreate(input: { lines: $lines, buyerIdentity: { countryCode: JP } }) { cart { ${CART} } userErrors { message } }
    }`,
    { lines: [{ merchandiseId: variantId, quantity }] },
    "no-store",
  );
  return unwrap(data.cartCreate);
}

export async function addLine(cartId: string, variantId: string, quantity: number): Promise<Cart> {
  const data = await storefront<{ cartLinesAdd: Mutation }>(
    `mutation Add($cartId: ID!, $lines: [CartLineInput!]!) ${ctx} {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART} } userErrors { message } }
    }`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] },
    "no-store",
  );
  return unwrap(data.cartLinesAdd);
}

export async function updateLine(cartId: string, lineId: string, quantity: number): Promise<Cart> {
  if (quantity <= 0) {
    const data = await storefront<{ cartLinesRemove: Mutation }>(
      `mutation Remove($cartId: ID!, $lineIds: [ID!]!) ${ctx} {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${CART} } userErrors { message } }
      }`,
      { cartId, lineIds: [lineId] },
      "no-store",
    );
    return unwrap(data.cartLinesRemove);
  }
  const data = await storefront<{ cartLinesUpdate: Mutation }>(
    `mutation Update($cartId: ID!, $lines: [CartLineUpdateInput!]!) ${ctx} {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ${CART} } userErrors { message } }
    }`,
    { cartId, lines: [{ id: lineId, quantity }] },
    "no-store",
  );
  return unwrap(data.cartLinesUpdate);
}

// ---------- Sample-mode cart (kept in a cookie as [variantId, qty] pairs) ----------

export function sampleCart(pairs: [string, number][]): Cart {
  const lines: CartLine[] = [];
  for (const [variantId, quantity] of pairs) {
    const product = sampleProducts.find((p) => p.variants.some((v) => v.id === variantId));
    const variant = product?.variants.find((v) => v.id === variantId);
    if (!product || !variant || quantity <= 0) continue;
    lines.push({
      id: variantId,
      quantity,
      variantId,
      productTitle: product.title,
      variantTitle: variant.title,
      handle: product.handle,
      image: null,
      price: variant.price,
      swatch: sampleSwatch(variantId),
    });
  }
  const total = lines.reduce((s, l) => s + Number(l.price.amount) * l.quantity, 0);
  return {
    id: "sample",
    checkoutUrl: null,
    totalQuantity: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal: { amount: String(total), currencyCode: "JPY" },
    lines,
  };
}
