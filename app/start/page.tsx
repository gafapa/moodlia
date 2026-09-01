import { createGettingStartedMetadata, GettingStartedPage } from "../getting-started";

export const metadata = createGettingStartedMetadata("en");

export default function StartPage() {
  return <GettingStartedPage locale="en" />;
}
