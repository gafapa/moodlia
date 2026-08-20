import { notFound } from "next/navigation";
import { products } from "../../catalog";
import { createProductMetadata, ProductDetailPage } from "../../detail-pages";
import { getLocalizedProduct } from "../../localization";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getLocalizedProduct(slug, "en");
  return product ? createProductMetadata(product, "en") : {};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getLocalizedProduct(slug, "en");
  if (!product) notFound();
  return <ProductDetailPage product={product} locale="en" />;
}
