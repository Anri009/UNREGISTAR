# UNREGISTAR オンラインストア

自由にデザインしたサイト（Next.js）で商品を見せ、決済は Shopify、配送は佐川急便（e-飛伝）で行うストアです。

## しくみ

- **商品・価格・在庫・写真**：すべて Shopify から読み込みます。Shopify の管理画面で商品を追加・変更すれば、約1分でサイトに反映されます。プログラムの修正は要りません。
- **カート**：Shopify のカート機能をそのまま使います。「購入手続きへ」を押すと Shopify の決済画面に移動します。
- **文章ページ**：Shopify の管理画面で書いた内容を、サイトの共通レイアウトで表示します。
- **配送**：Shopify に入った注文を e-飛伝 に取り込んで送り状を発行し、追跡番号を Shopify に戻します（下の「発送の流れ」）。

Shopify の設定がまだのときは、見本の商品（`lib/sample.ts`）で動きます。

## ページ

| URL | 内容 | 内容を書く場所 |
| --- | --- | --- |
| `/` | トップ兼商品一覧 | Shopify の商品 |
| `/products/[handle]` | 商品詳細（全商品共通） | Shopify の商品 |
| カート（横から出るパネル） | 数量変更、小計、購入手続きへ | 自動 |
| `/pages/legal` | 特定商取引法に基づく表記 | Shopify：オンラインストア → ページ（URLハンドルを `legal` にする） |
| `/policies/shipping` | 配送について | Shopify：設定 → ポリシー → 配送ポリシー |
| `/policies/refund` | 返品・交換について | Shopify：設定 → ポリシー → 返金ポリシー |
| `/policies/privacy` | プライバシーポリシー | Shopify：設定 → ポリシー → プライバシーポリシー |

## Shopify とつなぐ

1. Shopify 管理画面で **Headless** 販売チャネルをインストールし、ストアフロントを作成します。
2. Storefront API の **公開アクセストークン** をコピーします（プライベートトークンは使いません）。
3. `.env.example` を `.env.local` にコピーして、値を入れます。

```
SHOPIFY_STORE_DOMAIN=xxxx.myshopify.com
SHOPIFY_STOREFRONT_PUBLIC_TOKEN=（公開アクセストークン）
SHOPIFY_API_VERSION=2025-10
```

公開先（Vercel など）にも同じ3つを環境変数として登録します。

## 手元で動かす

```
npm install
npm run dev      # http://localhost:3000
npm run build    # 本番用ビルドと型チェック
```

## 発送の流れ（佐川急便 e-飛伝）

1. お客様がサイトで注文し、Shopify で支払う
2. Shopify の「注文管理」に注文が入る
3. 注文を CSV で書き出し（または e-飛伝 用 CSV を出力できる Shopify アプリを使い）、e-飛伝 に取り込んで送り状を発行
4. 発送後、追跡番号を Shopify の注文に入力（配送業者は「佐川急便」）すると、お客様に発送メールが届く

出荷数が増えたら、手順3と4を自動化するアプリや API 連携を検討します。

## デザイン

いまの見た目（`app/globals.css`）は試作に合わせた仮のものです。Figma のデザインが届いたら置き換えます。
