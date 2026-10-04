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
    nav: { apps: "Apps", install: "Install", how: "How it works", help: "Help" },
    navLabel: "Main navigation",
    language: "Language",
    homeLabel: "MoodlIA home",
    footer: "Open-source tools for Moodle. Independent project, not affiliated with Moodle HQ.",
    legal: "Legal notice",
    privacy: "Privacy",
    cookies: "Cookies",
    source: "Source code",
    home: {
      eyebrow: "Open source · Moodle 4.5 to 5.3",
      title: "Tools that make Moodle easier, for teachers and for administrators.",
      intro:
        "MoodlIA is a set of ten free, open-source apps. Some save teachers time with rubrics, backups, and course analytics. Others let administrators and AI assistants work with Moodle safely, always within Moodle's own permissions.",
      ctaApps: "See all apps",
      ctaInstall: "Installation guide",
      tasksTitle: "What do you want to do?",
      tasksBody: "Pick a task to go straight to the app that does it.",
      appsTitle: "The ten apps",
      appsBody: "Grouped by what you need to know to install them.",
      howTitle: "How the pieces fit",
      howBody: "Browser tools work on their own. The rest connect to Moodle in one of two ways: through Moodle's standard web services, or through the MoodlIA plugin installed on the site.",
      howLink: "Read how it works",
      faqTitle: "Common questions",
      helpTitle: "Not sure where to start?",
      helpBody: "Write to us with what you want to make easier in Moodle. A person answers.",
    },
    apps: {
      title: "All apps",
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
      status: { stable: "Available", preview: "Preview" },
      sourceLink: "Source code on GitHub",
      other: "Other apps",
      levelLabel: "Who can install it",
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
    nav: { apps: "Apps", install: "Instalar", how: "Cómo funciona", help: "Ayuda" },
    navLabel: "Navegación principal",
    language: "Idioma",
    homeLabel: "Inicio de MoodlIA",
    footer: "Herramientas de código abierto para Moodle. Proyecto independiente, sin relación con Moodle HQ.",
    legal: "Aviso legal",
    privacy: "Privacidad",
    cookies: "Cookies",
    source: "Código fuente",
    home: {
      eyebrow: "Código abierto · Moodle 4.5 a 5.3",
      title: "Herramientas que facilitan Moodle, para docentes y para administradores.",
      intro:
        "MoodlIA es un conjunto de diez aplicaciones gratuitas y de código abierto. Unas ahorran tiempo a los docentes con rúbricas, copias de seguridad y analítica de cursos. Otras permiten que administradores y asistentes de IA trabajen con Moodle de forma segura, siempre dentro de los permisos del propio Moodle.",
      ctaApps: "Ver todas las apps",
      ctaInstall: "Guía de instalación",
      tasksTitle: "¿Qué quieres hacer?",
      tasksBody: "Elige una tarea para ir directamente a la app que la resuelve.",
      appsTitle: "Las diez apps",
      appsBody: "Agrupadas según lo que hace falta saber para instalarlas.",
      howTitle: "Cómo encajan las piezas",
      howBody: "Las herramientas de navegador funcionan por sí solas. El resto se conecta a Moodle de una de dos formas: con los servicios web estándar de Moodle o con el plugin MoodlIA instalado en el sitio.",
      howLink: "Leer cómo funciona",
      faqTitle: "Preguntas frecuentes",
      helpTitle: "¿No sabes por dónde empezar?",
      helpBody: "Escríbenos qué quieres facilitar en Moodle. Te responde una persona.",
    },
    apps: {
      title: "Todas las apps",
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
      status: { stable: "Disponible", preview: "Preview" },
      sourceLink: "Código en GitHub",
      other: "Otras apps",
      levelLabel: "Quién puede instalarla",
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
    { q: "Is MoodlIA free?", a: "Yes. Every app is open source: most under the GPL 3.0 or later, and Moodle Core CLI and Analyzer Web under the MIT license. There are no accounts or subscriptions." },
    { q: "Is it an official Moodle product?", a: "No. MoodlIA is an independent project, not affiliated with, certified, or endorsed by Moodle HQ. Moodle is a registered trademark of Moodle Pty Ltd." },
    { q: "Which Moodle versions does it support?", a: "The plugin, MoodlIA CLI, and Moodle Core CLI support Moodle 4.5, 5.0, 5.1, 5.2, and 5.3 (validated against the 5.3 beta). Backup Converter targets versions from 3.11 to 5.1. Each app's page lists its own requirements." },
    { q: "Does my data go to a MoodlIA server?", a: "No. Browser tools process files and Moodle data on your computer. The plugin runs inside your Moodle. The command-line tools talk only to the Moodle sites you configure." },
    { q: "Can an AI assistant change my courses without permission?", a: "It can only do what the Moodle account behind its token is allowed to do. Use a dedicated account with the minimum permissions and try changes in a test course first." },
  ],
  es: [
    { q: "¿MoodlIA es gratuito?", a: "Sí. Todas las apps son de código abierto: la mayoría con licencia GPL 3.0 o posterior, y Moodle Core CLI y Analyzer Web con licencia MIT. No hay cuentas ni suscripciones." },
    { q: "¿Es un producto oficial de Moodle?", a: "No. MoodlIA es un proyecto independiente, sin relación, certificación ni respaldo de Moodle HQ. Moodle es una marca registrada de Moodle Pty Ltd." },
    { q: "¿Qué versiones de Moodle admite?", a: "El plugin, MoodlIA CLI y Moodle Core CLI admiten Moodle 4.5, 5.0, 5.1, 5.2 y 5.3 (validada con la beta de 5.3). Backup Converter convierte para versiones de 3.11 a 5.1. La página de cada app indica sus requisitos." },
    { q: "¿Mis datos van a un servidor de MoodlIA?", a: "No. Las herramientas de navegador procesan los archivos y los datos de Moodle en tu ordenador. El plugin funciona dentro de tu Moodle. Las herramientas de terminal solo hablan con los sitios Moodle que configures." },
    { q: "¿Puede un asistente de IA cambiar mis cursos sin permiso?", a: "Solo puede hacer lo que permita la cuenta de Moodle de su token. Usa una cuenta dedicada con los permisos mínimos y prueba los cambios primero en un curso de prueba." },
  ],
};
