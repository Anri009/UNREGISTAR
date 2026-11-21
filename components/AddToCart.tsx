"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

/** Option pickers (colour, etc.) built from whatever options the product has in Shopify. */
export function AddToCart({ product, onVariantImage }: { product: Product; onVariantImage?: (variantId: string) => void }) {
  const { add, pending } = useCart();
  const first = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries((first?.selectedOptions ?? []).map((o) => [o.name, o.value])),
  );

  const variant = useMemo(
    () => product.variants.find((v) => v.selectedOptions.every((o) => selected[o.name] === o.value)),
    [product.variants, selected],
  );
  const visibleOptions = product.options.filter((o) => !(o.values.length === 1 && o.values[0] === "Default Title"));

  return (
    <div className="buy">
      <p className="price big">{formatPrice(variant?.price ?? product.price)}（税込）</p>
      {visibleOptions.map((opt) => (
        <fieldset key={opt.name} className="option">
          <legend>{opt.name}</legend>
          <div className="option-values">
            {opt.values.map((val) => {
              const id = `opt-${opt.name}-${val}`;
              return (
                <label key={val} htmlFor={id} className={selected[opt.name] === val ? "chip on" : "chip"}>
                  <input
                    id={id}
                    type="radio"
                    name={opt.name}
                    value={val}
                    checked={selected[opt.name] === val}
                    onChange={() => {
                      const next = { ...selected, [opt.name]: val };
                      setSelected(next);
                      const v = product.variants.find((x) => x.selectedOptions.every((o) => next[o.name] === o.value));
                      if (v) onVariantImage?.(v.id);
                    }}
                  />
                  {val}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      <button className="btn" type="button" disabled={!variant?.availableForSale || pending} onClick={() => variant && add(variant.id)}>
        {!variant ? "この組み合わせはありません" : variant.availableForSale ? (pending ? "追加しています…" : "カートに入れる") : "売り切れ"}
      </button>
    </div>
  );
}
