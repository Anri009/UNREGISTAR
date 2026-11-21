// Placeholder products used until the Shopify token is set.
// Names, prices and specs are examples only.
import type { Product } from "./types";

const yen = (n: number) => ({ amount: String(n), currencyCode: "JPY" });

type Seed = { handle: string; title: string; price: number; colors: [string, string][]; desc: string };

const seeds: Seed[] = [
  { handle: "long-wallet", title: "長財布", price: 28600, colors: [["ブラック", "#1c1a18"], ["キャメル", "#6b4428"], ["バーガンディ", "#4a1f22"]], desc: "カード12枚とマチ付きの小銭入れ。W190 × H95 × D20 mm。" },
  { handle: "bifold-wallet", title: "二つ折り財布", price: 22000, colors: [["キャメル", "#6b4428"], ["ブラック", "#1c1a18"], ["オリーブ", "#3d4232"]], desc: "カード8枚とボックス型の小銭入れ。W110 × H95 × D22 mm。" },
  { handle: "mini-wallet", title: "ミニ財布", price: 17600, colors: [["バーガンディ", "#4a1f22"], ["ブラック", "#1c1a18"]], desc: "手のひらに収まるサイズ。カード4枚。W85 × H78 × D25 mm。" },
  { handle: "coin-case", title: "コインケース", price: 9900, colors: [["オリーブ", "#3d4232"], ["キャメル", "#6b4428"]], desc: "L字ファスナーで中が見やすい小銭入れ。W90 × H72 × D18 mm。" },
  { handle: "fragment-case", title: "フラグメントケース", price: 8800, colors: [["グレージュ", "#8a8478"], ["ブラック", "#1c1a18"]], desc: "カード4枚と折った紙幣が入る薄型ケース。W105 × H70 × D6 mm。" },
];

export const sampleProducts: Product[] = seeds.map((s) => ({
  handle: s.handle,
  title: s.title,
  price: yen(s.price),
  image: null,
  swatch: s.colors[0][1],
  descriptionHtml: `<p>${s.desc}</p><p>（見本の商品です。Shopifyとつなぐと実際の商品に置き換わります）</p>`,
  images: [],
  options: [{ name: "カラー", values: s.colors.map((c) => c[0]) }],
  variants: s.colors.map(([name], i) => ({
    id: `sample:${s.handle}:${i}`,
    title: name,
    availableForSale: true,
    price: yen(s.price),
    selectedOptions: [{ name: "カラー", value: name }],
    image: null,
  })),
}));

export const sampleSwatch = (variantId: string): string | undefined => {
  const [, handle, idx] = variantId.split(":");
  const seed = seeds.find((s) => s.handle === handle);
  return seed?.colors[Number(idx)]?.[1];
};
