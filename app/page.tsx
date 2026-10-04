import { HomePage, homeMetadata } from "./home";

export const metadata = homeMetadata("en");

export default function Home() {
  return <HomePage locale="en" />;
}
