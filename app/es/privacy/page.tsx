import { createLegalMetadata, LegalPage } from "../../legal-pages";

export const metadata = createLegalMetadata("privacy", "es");

export default function SpanishPrivacyPage() {
  return <LegalPage kind="privacy" locale="es" />;
}
