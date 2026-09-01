import type { MetadataRoute } from "next";
import { products, ways } from "./catalog";
import { legalPaths } from "./legal-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-18");
  const localizedEntry = (
    englishPath: string,
    changeFrequency: "weekly" | "monthly",
    priority: number,
    spanishPath = englishPath === "/" ? "/es" : `/es${englishPath}`,
  ) => {
    const englishUrl = `https://moodlia.com${englishPath}`;
    const spanishUrl = `https://moodlia.com${spanishPath}`;
    const alternates = { languages: { en: englishUrl, es: spanishUrl } };
    return [
      { url: englishUrl, lastModified, changeFrequency, priority, alternates },
      { url: spanishUrl, lastModified, changeFrequency, priority, alternates },
    ];
  };

  return [
    ...localizedEntry("/", "weekly", 1),
    ...localizedEntry("/start", "monthly", 0.9, "/es/empezar"),
    ...ways.flatMap((way) => localizedEntry(`/ways/${way.slug}`, "monthly", 0.8)),
    ...products.flatMap((product) => localizedEntry(`/products/${product.slug}`, "monthly", 0.7)),
    ...Object.values(legalPaths).flatMap(({ en, es }) => [
      {
        url: `https://moodlia.com${en}`,
        lastModified,
        changeFrequency: "yearly" as const,
        priority: 0.2,
        alternates: { languages: { en: `https://moodlia.com${en}`, es: `https://moodlia.com${es}` } },
      },
      {
        url: `https://moodlia.com${es}`,
        lastModified,
        changeFrequency: "yearly" as const,
        priority: 0.2,
        alternates: { languages: { en: `https://moodlia.com${en}`, es: `https://moodlia.com${es}` } },
      },
    ]),
  ];
}
