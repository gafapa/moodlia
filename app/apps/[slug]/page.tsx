import { notFound } from "next/navigation";
import { AppPage, appMetadata } from "../../apps-pages";
import { apps, getApp } from "../../content";

export function generateStaticParams() {
  return apps.map((app) => ({ slug: app.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const app = getApp((await params).slug);
  return app ? appMetadata(app, "en") : {};
}

export default async function App({ params }: { params: Promise<{ slug: string }> }) {
  const app = getApp((await params).slug);
  if (!app) notFound();
  return <AppPage app={app} locale="en" />;
}
