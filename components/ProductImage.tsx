import Image from "next/image";
import type { Image as Img } from "@/lib/types";

/** Shopify image, or a drawn wallet placeholder in sample mode. */
export function ProductImage({ image, swatch, alt, sizes, priority }: { image: Img | null; swatch?: string; alt: string; sizes: string; priority?: boolean }) {
  if (image) {
    return (
      <div className="stage">
        <Image src={image.url} alt={image.altText || alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover" }} />
      </div>
    );
  }
  return (
    <div className="stage" role="img" aria-label={alt}>
      <div className="wallet" style={{ ["--c" as string]: swatch || "#3a3732" }} />
    </div>
  );
}
