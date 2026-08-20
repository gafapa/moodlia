import type { Metadata } from "next";
import { MoodliaHome } from "../page";

export const metadata: Metadata = {
  title: "MoodlIA — Un solo Moodle. Tres formas de avanzar.",
  description:
    "MoodlIA acerca la IA, herramientas docentes prácticas e información clara del aprendizaje a Moodle. Descubre tres formas de avanzar y recibe ayuda directa cuando la necesites.",
  keywords: [
    "IA para Moodle",
    "herramientas de IA para Moodle",
    "herramientas docentes Moodle",
    "calificación en Moodle",
    "rúbricas Moodle",
    "analítica de Moodle",
    "herramientas Moodle de código abierto",
  ],
  alternates: {
    canonical: "/es",
    languages: { en: "/", es: "/es", "x-default": "/" },
  },
  openGraph: {
    title: "MoodlIA — Un solo Moodle. Tres formas de avanzar.",
    description:
      "Conecta la IA, enseña con confianza y comprende lo importante, con ayuda directa cuando la necesites.",
    url: "https://moodlia.com/es",
    siteName: "MoodlIA",
    locale: "es_ES",
    type: "website",
    images: [{
      url: "/moodlia-educators-together-v2.jpg",
      width: 1536,
      height: 1024,
      alt: "Docentes colaborando con MoodlIA en un espacio educativo luminoso",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodlIA — Un solo Moodle. Tres formas de avanzar.",
    description:
      "Conecta la IA, enseña con confianza y comprende lo importante, con ayuda directa cuando la necesites.",
    images: ["/moodlia-educators-together-v2.jpg"],
  },
};

export default function SpanishHome() {
  return <MoodliaHome locale="es" />;
}
