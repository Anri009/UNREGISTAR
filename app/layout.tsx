import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { loadCart } from "./actions";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "UNREGISTAR", template: "%s | UNREGISTAR" },
  description: "UNREGISTAR のレザーグッズ。",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cart = await loadCart();
  return (
    <html lang="ja">
      <body>
        <CartProvider initialCart={cart}>
          <Header />
          <main className="wrap">{children}</main>
          <footer className="wrap site-footer">
            <span>© UNREGISTAR</span>
            <nav aria-label="ご利用案内">
              <Link href="/policies/shipping">配送について</Link>
              <Link href="/policies/refund">返品・交換について</Link>
              <Link href="/pages/legal">特定商取引法に基づく表記</Link>
              <Link href="/policies/privacy">プライバシーポリシー</Link>
            </nav>
          </footer>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
