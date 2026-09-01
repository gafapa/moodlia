import { createLegalMetadata, LegalPage } from "../../legal-pages";

export const metadata = createLegalMetadata("legal", "es");

export default function SpanishLegalNoticePage() {
  return <LegalPage kind="legal" locale="es" />;
}
