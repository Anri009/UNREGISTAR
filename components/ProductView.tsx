"use client";

import { useState } from "react";
import { sampleSwatch } from "@/lib/sample";
import type { Product } from "@/lib/types";
import { AddToCart } from "./AddToCart";
import { ProductImage } from "./ProductImage";

export function ProductView({ product }: { product: Product }) {
  const images = product.images.length ? product.images : [product.image];
  const [active, setActive] = useState(0);
  const [swatch, setSwatch] = useState(product.swatch);

  const showVariant = (variantId: string) => {
    const v = product.variants.find((x) => x.id === variantId);
    const i = v?.image ? product.images.findIndex((im) => im.url === v.image!.url) : -1;
    if (i >= 0) setActive(i);
    const s = sampleSwatch(variantId);
    if (s) setSwatch(s);
  };

  return (
    <section className="detail">
      <div className="gallery">
        <ProductImage image={images[active] ?? null} swatch={swatch} alt={product.title} sizes="(max-width: 760px) 100vw, 55vw" priority />
        {product.images.length > 1 && (
          <div className="thumbs">
            {product.images.map((im, i) => (
              <button key={im.url} type="button" className={i === active ? "on" : ""} onClick={() => setActive(i)} aria-label={`画像${i + 1}を表示`}>
                <ProductImage image={im} alt="" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="detail-info">
        <h1>{product.title}</h1>
        <AddToCart product={product} onVariantImage={showVariant} />
        <div className="description" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
        <p className="ship">
          <b>佐川急便でお届けします。</b>
          <br />
          送料は購入手続きの画面で表示されます。
        </p>
      </div>
    </section>
  );
}
