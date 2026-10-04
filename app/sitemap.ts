import type { MetadataRoute } from "next";
import { apps } from "./content";
import { alternates, siteUrl } from "./i18n";
import { legalPaths } from "./legal-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-05");
  const entries = (
    pair: { en: string; es: string },
    changeFrequency: "weekly" | "monthly" | "yearly",
    priority: number,
  ) => {
    const languages = { en: `${siteUrl}${pair.en}`, es: `${siteUrl}${pair.es}` };
    return [
      { url: languages.en, lastModified, changeFrequency, priority, alternates: { languages } },
      { url: languages.es, lastModified, changeFrequency, priority, alternates: { languages } },
    ];
  };

  return [
    ...entries(alternates("home"), "weekly", 1),
    ...entries(alternates("apps"), "weekly", 0.9),
    ...entries(alternates("install"), "weekly", 0.9),
    ...entries(alternates("how"), "monthly", 0.7),
    ...apps.flatMap((app) => entries(alternates("apps", app.slug), "monthly", 0.8)),
    ...Object.values(legalPaths).flatMap((pair) => entries(pair, "yearly", 0.2)),
  ];
}
