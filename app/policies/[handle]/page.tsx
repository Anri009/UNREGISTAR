import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotYetWritten, TextPageView } from "@/components/TextPageView";
import { getPolicy, isPolicyHandle } from "@/lib/shopify";

export const revalidate = 60;

type Props = { params: Promise<{ handle: string }> };

const titles = { privacy: "プライバシーポリシー", shipping: "配送について", refund: "返品・交換について", terms: "利用規約" };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  return { title: isPolicyHandle(handle) ? titles[handle] : undefined };
}

export default async function PolicyPage({ params }: Props) {
  const { handle } = await params;
  if (!isPolicyHandle(handle)) notFound();
  const policy = await getPolicy(handle);
  return policy?.body ? <TextPageView page={{ title: titles[handle], body: policy.body }} /> : <NotYetWritten title={titles[handle]} />;
}
