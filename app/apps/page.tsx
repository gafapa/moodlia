import { AppsIndexPage, appsIndexMetadata } from "../apps-pages";

export const metadata = appsIndexMetadata("en");

export default function Apps() {
  return <AppsIndexPage locale="en" />;
}
