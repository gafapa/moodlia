import { InstallPage, installMetadata } from "../../install-page";

export const metadata = installMetadata("es");

export default function SpanishInstall() {
  return <InstallPage locale="es" />;
}
