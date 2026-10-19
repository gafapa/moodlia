import privacyContract from "../config/extension-privacy.json";
import type { Locale } from "./content";

export function ExtensionPrivacyLink({ slug, locale }: { slug: string; locale: Locale }) {
  const policy = privacyContract.policies.find((item) => item.id === slug);
  if (!policy) return null;

  const name = slug === "rubrics" ? "Rubrics" : "Corrector";
  return <p className="extension-privacy"><a href={policy.path}>{locale === "es" ? `Privacidad de ${name} (en inglés)` : `${name} privacy policy`}</a></p>;
}
