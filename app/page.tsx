import { ProductGrid } from "@/components/ProductGrid";
import { getProducts, isSampleMode } from "@/lib/shopify";

export const revalidate = 60;

export default async function Home() {
  const products = await getProducts();
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Leather Goods</p>
        <h1>Carry less.<br />Keep what matters.</h1>
        <p className="muted">レザーのお財布と小物。佐川急便でお届けします。</p>
        {isSampleMode && <p className="note">見本モードで表示しています。商品はShopifyとつなぐと実際のものに置き換わります。</p>}
      </section>
      <section className="sec" id="collection">
        <p className="eyebrow">Collection</p>
        <ProductGrid products={products} />
      </section>
    </>
  );
}
