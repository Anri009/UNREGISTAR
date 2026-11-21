import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotYetWritten, TextPageView } from "@/components/TextPageView";
import { getPage, isSampleMode } from "@/lib/shopify";

export const revalidate = 60;

type Props = { params: Promise<{ handle: string }> };

const fallbackTitles: Record<string, string> = { legal: "特定商取引法に基づく表記" };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const page = await getPage(handle);
  return { title: page?.title ?? fallbackTitles[handle] };
}

export default async function ShopifyPage({ params }: Props) {
  const { handle } = await params;
  const page = await getPage(handle);
  if (page) return <TextPageView page={page} />;
  if (fallbackTitles[handle] && isSampleMode) return <NotYetWritten title={fallbackTitles[handle]} />;
  notFound();
}
