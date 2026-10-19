import type { AppSlug, Locale } from "./content";

export type { Locale } from "./content";

export const siteUrl = "https://moodlia.com";
export const contactEmail = "contact@moodlia.com";

type PageKey = "home" | "apps" | "install" | "how";

const pagePaths: Record<PageKey, Record<Locale, string>> = {
  home: { en: "/", es: "/es" },
  apps: { en: "/apps", es: "/es/apps" },
  install: { en: "/install", es: "/es/instalar" },
  how: { en: "/how-it-works", es: "/es/como-funciona" },
};

export function pagePath(page: PageKey, locale: Locale) {
  return pagePaths[page][locale];
}

export function appPath(slug: AppSlug, locale: Locale) {
  return `${pagePaths.apps[locale]}/${slug}`;
}

/** English and Spanish URLs of the same page, for hreflang and the language switch. */
export function alternates(page: PageKey, slug?: AppSlug) {
  return {
    en: slug ? appPath(slug, "en") : pagePaths[page].en,
    es: slug ? appPath(slug, "es") : pagePaths[page].es,
  };
}

export const ui = {
  en: {
    skip: "Skip to content",
    nav: { apps: "Tools", install: "Get started", how: "How it works", help: "Help" },
    navLabel: "Main navigation",
    language: "Language",
    homeLabel: "MoodlIA home",
    footer: "Open-source tools for Moodle. Independent project, not affiliated with Moodle HQ.",
    legal: "Legal notice",
    privacy: "Privacy",
    cookies: "Cookies",
    source: "Source code",
    apps: {
      title: "Tools for your Moodle work",
      intro: "Every MoodlIA app, what it does, what it needs, and how to get it.",
      open: "Details and installation",
    },
    app: {
      breadcrumb: "Apps",
      whatItDoes: "What it does",
      needs: "What you need",
      install: "Installation",
      firstUse: "First use",
      limits: "Good to know",
      docs: "Documentation",
      version: "Version",
      license: "License",
      status: { stable: "Available", preview: "Preview / beta", manual: "Manual install", source: "Run from source" },
      sourceLink: "Source code on GitHub",
      other: "Other apps",
    },
    install: {
      title: "Installation guide",
      intro: "How to get each app, grouped by where it runs. Each app's page has the full steps.",
      jump: "Go to",
      full: "Full instructions",
      chooseTitle: "Not sure which one you need?",
      chooseBody: "Start from the task you want to do on the home page, or write to us.",
    },
    how: {
      title: "How MoodlIA works",
      intro: "MoodlIA is not one product but a family of independent apps. This page explains how they relate, what reaches your Moodle site, and what stays on your computer.",
    },
    helpTitle: "Need help?",
    helpBody: "Questions about installing or using any MoodlIA app, or ideas for new ones: write to us.",
    copy: "Copy",
    copied: "Copied",
  },
  es: {
    skip: "Saltar al contenido",
    nav: { apps: "Herramientas", install: "Empezar", how: "Cómo funciona", help: "Ayuda" },
    navLabel: "Navegación principal",
    language: "Idioma",
    homeLabel: "Inicio de MoodlIA",
    footer: "Herramientas de código abierto para Moodle. Proyecto independiente, sin relación con Moodle HQ.",
    legal: "Aviso legal",
    privacy: "Privacidad",
    cookies: "Cookies",
    source: "Código fuente",
    apps: {
      title: "Herramientas para trabajar con Moodle",
      intro: "Cada app de MoodlIA: qué hace, qué necesita y cómo conseguirla.",
      open: "Detalles e instalación",
    },
    app: {
      breadcrumb: "Apps",
      whatItDoes: "Qué hace",
      needs: "Qué necesitas",
      install: "Instalación",
      firstUse: "Primer uso",
      limits: "Conviene saber",
      docs: "Documentación",
      version: "Versión",
      license: "Licencia",
      status: { stable: "Disponible", preview: "Preview / beta", manual: "Instalación manual", source: "Código disponible" },
      sourceLink: "Código en GitHub",
      other: "Otras apps",
    },
    install: {
      title: "Guía de instalación",
      intro: "Cómo conseguir cada app, agrupadas según dónde funcionan. La página de cada app tiene los pasos completos.",
      jump: "Ir a",
      full: "Instrucciones completas",
      chooseTitle: "¿No sabes cuál necesitas?",
      chooseBody: "Empieza por la tarea que quieres hacer en la portada, o escríbenos.",
    },
    how: {
      title: "Cómo funciona MoodlIA",
      intro: "MoodlIA no es un único producto sino una familia de apps independientes. Esta página explica cómo se relacionan, qué llega a tu sitio Moodle y qué se queda en tu ordenador.",
    },
    helpTitle: "¿Necesitas ayuda?",
    helpBody: "Dudas sobre cómo instalar o usar cualquier app de MoodlIA, o ideas para nuevas: escríbenos.",
    copy: "Copiar",
    copied: "Copiado",
  },
} as const;

export const faq: Record<Locale, Array<{ q: string; a: string }>> = {
  en: [
    { q: "Is MoodlIA free?", a: "Yes. The tools are open source: most under GPL 3.0 or later, with Moodle Core CLI and Analyzer Web under MIT. MoodlIA does not require a vendor account or subscription. A selected AI provider may have its own account, fees and terms." },
    { q: "Is it an official Moodle product?", a: "No. MoodlIA is an independent project, not affiliated with, certified, or endorsed by Moodle HQ. Moodle is a registered trademark of Moodle Pty Ltd." },
    { q: "Which Moodle versions does it support?", a: "The plugin, MoodlIA CLI, and Moodle Core CLI support Moodle 4.5, 5.0, 5.1, 5.2, and 5.3 (validated against the 5.3 beta). Backup Converter targets versions from 3.11 to 5.1. Each app's page lists its own requirements." },
    { q: "Where does my data go?", a: "The file converters process archives in your browser. The plugin runs inside your Moodle, and CLI tools connect to the configured sites. AI features send the required evidence to the assistant or provider you select; a remote provider receives that evidence. Use an institution-approved setup. MoodlIA does not operate a central AI service that receives your coursework." },
    { q: "Can an AI assistant change my courses without permission?", a: "It can only do what the Moodle account behind its token is allowed to do. Use a dedicated account with the minimum permissions and try changes in a test course first." },
  ],
  es: [
    { q: "¿MoodlIA es gratuito?", a: "Sí. Las herramientas son de código abierto: la mayoría con GPL 3.0 o posterior, y Moodle Core CLI y Analyzer Web con MIT. MoodlIA no exige una cuenta ni una suscripción propias. El proveedor de IA elegido puede tener sus propias cuentas, tarifas y condiciones." },
    { q: "¿Es un producto oficial de Moodle?", a: "No. MoodlIA es un proyecto independiente, sin relación, certificación ni respaldo de Moodle HQ. Moodle es una marca registrada de Moodle Pty Ltd." },
    { q: "¿Qué versiones de Moodle admite?", a: "El plugin, MoodlIA CLI y Moodle Core CLI admiten Moodle 4.5, 5.0, 5.1, 5.2 y 5.3 (validada con la beta de 5.3). Backup Converter convierte para versiones de 3.11 a 5.1. La página de cada app indica sus requisitos." },
    { q: "¿Adónde van mis datos?", a: "Los conversores procesan los archivos en tu navegador. El plugin funciona dentro de tu Moodle y las herramientas de terminal se conectan a los sitios configurados. Las funciones de IA envían las evidencias necesarias al asistente o proveedor elegido; un proveedor remoto recibe esas evidencias. Usa una configuración autorizada por tu centro. MoodlIA no opera un servicio central de IA que reciba los trabajos." },
    { q: "¿Puede un asistente de IA cambiar mis cursos sin permiso?", a: "Solo puede hacer lo que permita la cuenta de Moodle de su token. Usa una cuenta dedicada con los permisos mínimos y prueba los cambios primero en un curso de prueba." },
  ],
};
