import type { TextPage } from "@/lib/types";

/** Shared layout for every text page (特商法, privacy, shipping...). Body is HTML written in Shopify admin. */
export function TextPageView({ page }: { page: TextPage }) {
  return (
    <article className="text-page">
      <h1>{page.title}</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: page.body }} />
    </article>
  );
}

export function NotYetWritten({ title }: { title: string }) {
  return (
    <article className="text-page">
      <h1>{title}</h1>
      <p className="muted">このページの内容はShopifyの管理画面で作成すると、ここに表示されます。</p>
    </article>
  );
}
