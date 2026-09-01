import { createLegalMetadata, LegalPage } from "../legal-pages";

export const metadata = createLegalMetadata("legal", "en");

export default function LegalNoticePage() {
  return <LegalPage kind="legal" locale="en" />;
}
