import { createLegalMetadata, LegalPage } from "../../legal-pages";

export const metadata = createLegalMetadata("cookies", "es");

export default function SpanishCookiesPage() {
  return <LegalPage kind="cookies" locale="es" />;
}
