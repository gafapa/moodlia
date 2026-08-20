import { notFound } from "next/navigation";
import { products } from "../../../catalog";
import { createProductMetadata, ProductDetailPage } from "../../../detail-pages";
import { getLocalizedProduct } from "../../../localization";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getLocalizedProduct(slug, "es");
  return product ? createProductMetadata(product, "es") : {};
}

export default async function SpanishProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getLocalizedProduct(slug, "es");
  if (!product) notFound();
  return <ProductDetailPage product={product} locale="es" />;
}
