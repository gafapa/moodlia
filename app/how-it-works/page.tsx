import { HowPage, howMetadata } from "../how-page";

export const metadata = howMetadata("en");

export default function HowItWorks() {
  return <HowPage locale="en" />;
}
