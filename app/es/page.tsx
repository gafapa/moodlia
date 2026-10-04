import { HomePage, homeMetadata } from "../home";

export const metadata = homeMetadata("es");

export default function SpanishHome() {
  return <HomePage locale="es" />;
}
