import type { Metadata } from "next";
import { MoodliaHome } from "../page";

export const metadata: Metadata = {
  title: "MoodlIA — Haz que Moodle trabaje contigo.",
  description:
    "MoodlIA ayuda a planificar el aprendizaje, enseñar con más tiempo y saber dónde ayudar después en Moodle. Herramientas gratuitas, abiertas y ayuda humana directa.",
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
    title: "MoodlIA — Haz que Moodle trabaje contigo.",
    description:
      "Planifica el aprendizaje, enseña con más tiempo y sabe dónde ayudar después con herramientas MoodlIA y ayuda humana directa.",
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
    title: "MoodlIA — Haz que Moodle trabaje contigo.",
    description:
      "Planifica el aprendizaje, enseña con más tiempo y sabe dónde ayudar después con herramientas MoodlIA y ayuda humana directa.",
    images: ["/moodlia-educators-together-v2.jpg"],
  },
};

export default function SpanishHome() {
  return <MoodliaHome locale="es" />;
}
