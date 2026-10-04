import type { Metadata } from "next";
import type { Locale } from "./content";
import { siteUrl } from "./i18n";

export const ogImage = { url: "/og-moodlia.png", width: 1200, height: 630, alt: "MoodlIA" };

export function pageMetadata({
  locale, title, description, alternate,
}: {
  locale: Locale;
  title: string;
  description: string;
  alternate: { en: string; es: string };
}): Metadata {
  const path = alternate[locale];
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { en: alternate.en, es: alternate.es, "x-default": alternate.en },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path}`,
      siteName: "MoodlIA",
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage.url] },
  };
}
