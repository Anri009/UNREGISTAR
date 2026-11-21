"use client";

import Link from "next/link";
import { useEffect } from "react";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import { ProductImage } from "./ProductImage";

export function CartDrawer() {
  const { cart, open, setOpen, setQuantity, pending, error } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;
  const lines = cart?.lines ?? [];

  return (
    <>
      <div className="scrim" onClick={() => setOpen(false)} />
      <aside className="drawer" aria-label="カート" aria-busy={pending}>
        <div className="drawer-head">
          <h2>Bag</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="カートを閉じる">
            ×
          </button>
        </div>

        <div className="lines">
          {lines.length === 0 && <p className="muted">カートは空です。</p>}
          {lines.map((l) => (
            <div className="line" key={l.id}>
              <Link href={`/products/${l.handle}`} onClick={() => setOpen(false)} className="mini">
                <ProductImage image={l.image} swatch={l.swatch} alt={l.productTitle} sizes="64px" />
              </Link>
              <div className="line-info">
                <div>{l.productTitle}</div>
                {l.variantTitle !== "Default Title" && <div className="muted small">{l.variantTitle}</div>}
                <div className="qty">
                  <button type="button" disabled={pending} onClick={() => setQuantity(l.id, l.quantity - 1)} aria-label="1つ減らす">
                    −
                  </button>
                  <span>{l.quantity}</span>
                  <button type="button" disabled={pending} onClick={() => setQuantity(l.id, l.quantity + 1)} aria-label="1つ増やす">
                    ＋
                  </button>
                </div>
              </div>
              <span className="price">{formatPrice({ ...l.price, amount: String(Number(l.price.amount) * l.quantity) })}</span>
            </div>
          ))}
        </div>

        <div className="sum">
          <span>小計（税込）</span>
          <span>{cart ? formatPrice(cart.subtotal) : "¥0"}</span>
        </div>
        <div className="sum muted">
          <span>送料（佐川急便）</span>
          <span>購入手続きの画面で表示</span>
        </div>

        {cart?.checkoutUrl ? (
          <a className={`btn${lines.length === 0 ? " disabled" : ""}`} href={lines.length ? cart.checkoutUrl : undefined} aria-disabled={lines.length === 0}>
            購入手続きへ
          </a>
        ) : (
          <>
            <button className="btn" type="button" disabled>
              購入手続きへ
            </button>
            <p className="note">見本モードです。Shopifyとつなぐと、ここからShopifyの購入画面へ進みます。</p>
          </>
        )}
        {error && (
          <p className="note error" role="alert">
            {error}
          </p>
        )}
      </aside>
    </>
  );
}
