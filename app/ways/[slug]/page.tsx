import { notFound } from "next/navigation";
import { ways } from "../../catalog";
import { createWayMetadata, WayDetailPage } from "../../detail-pages";
import { getLocalizedWay } from "../../localization";

export function generateStaticParams() {
  return ways.map((way) => ({ slug: way.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const way = getLocalizedWay(slug, "en");
  return way ? createWayMetadata(way, "en") : {};
}

export default async function WayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const way = getLocalizedWay(slug, "en");
  if (!way) notFound();
  return <WayDetailPage way={way} locale="en" />;
}
