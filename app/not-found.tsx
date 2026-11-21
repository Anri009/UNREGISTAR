import Link from "next/link";

export default function NotFound() {
  return (
    <article className="text-page">
      <h1>ページが見つかりません</h1>
      <p className="muted">URLが変わったか、商品の販売が終わった可能性があります。</p>
      <p>
        <Link href="/#collection">商品一覧へ戻る</Link>
      </p>
    </article>
  );
}
