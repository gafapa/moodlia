import type { MetadataRoute } from "next";
import { products, ways } from "./catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-18");
  const localizedEntry = (
    englishPath: string,
    changeFrequency: "weekly" | "monthly",
    priority: number,
  ) => {
    const englishUrl = `https://moodlia.com${englishPath}`;
    const spanishUrl = `https://moodlia.com${englishPath === "/" ? "/es" : `/es${englishPath}`}`;
    const alternates = { languages: { en: englishUrl, es: spanishUrl } };
    return [
      { url: englishUrl, lastModified, changeFrequency, priority, alternates },
      { url: spanishUrl, lastModified, changeFrequency, priority, alternates },
    ];
  };

  return [
    ...localizedEntry("/", "weekly", 1),
    ...ways.flatMap((way) => localizedEntry(`/ways/${way.slug}`, "monthly", 0.8)),
    ...products.flatMap((product) => localizedEntry(`/products/${product.slug}`, "monthly", 0.7)),
  ];
}
