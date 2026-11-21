"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function Header() {
  const { cart, setOpen } = useCart();
  return (
    <header className="site-header">
      <div className="wrap bar">
        <Link className="logo" href="/">
          UNREGISTAR
        </Link>
        <nav aria-label="メイン">
          <Link href="/#collection">Shop</Link>
          <button type="button" onClick={() => setOpen(true)}>
            Bag <span className="count">{cart?.totalQuantity ?? 0}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
