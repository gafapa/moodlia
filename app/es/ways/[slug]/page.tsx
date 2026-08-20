import { notFound } from "next/navigation";
import { ways } from "../../../catalog";
import { createWayMetadata, WayDetailPage } from "../../../detail-pages";
import { getLocalizedWay } from "../../../localization";

export function generateStaticParams() {
  return ways.map((way) => ({ slug: way.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const way = getLocalizedWay(slug, "es");
  return way ? createWayMetadata(way, "es") : {};
}

export default async function SpanishWayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const way = getLocalizedWay(slug, "es");
  if (!way) notFound();
  return <WayDetailPage way={way} locale="es" />;
}
