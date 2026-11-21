import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";
import { ProductImage } from "./ProductImage";

export function ProductGrid({ products }: { products: ProductSummary[] }) {
  if (!products.length) return <p className="muted">商品の準備中です。</p>;
  return (
    <div className="grid">
      {products.map((p) => (
        <Link className="card" href={`/products/${p.handle}`} key={p.handle}>
          <ProductImage image={p.image} swatch={p.swatch} alt={p.title} sizes="(max-width: 760px) 50vw, 25vw" />
          <span className="meta">
            <span className="nm">{p.title}</span>
            <span className="price">{formatPrice(p.price)}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
