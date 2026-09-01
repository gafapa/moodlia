import { createLegalMetadata, LegalPage } from "../legal-pages";

export const metadata = createLegalMetadata("cookies", "en");

export default function CookiesPage() {
  return <LegalPage kind="cookies" locale="en" />;
}
