import { InstallPage, installMetadata } from "../install-page";

export const metadata = installMetadata("en");

export default function Install() {
  return <InstallPage locale="en" />;
}
