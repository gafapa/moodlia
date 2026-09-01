import { createLegalMetadata, LegalPage } from "../legal-pages";

export const metadata = createLegalMetadata("privacy", "en");

export default function PrivacyPage() {
  return <LegalPage kind="privacy" locale="en" />;
}
