import {
  products,
  ways,
  type MoodliaProduct,
  type MoodliaWay,
  type WaySlug,
} from "./catalog";

export type Locale = "en" | "es";

type WayCopy = Pick<
  MoodliaWay,
  "title" | "shortTitle" | "description" | "introduction" | "imageAlt" | "imageCaption" | "outcomes"
>;

type ProductCopy = Pick<
  MoodliaProduct,
  | "kind"
  | "status"
  | "description"
  | "introduction"
  | "highlights"
  | "bestFor"
  | "requirements"
  | "sourceLabel"
> & Partial<Pick<MoodliaProduct, "secondaryLabel">>;

const spanishWays: Record<WaySlug, WayCopy> = {
  "ai-integration": {
    title: "Integra la IA en Moodle",
    shortTitle: "Integración con IA",
    description: "Conecta las herramientas de IA que ya utilizas y convierte ideas en acciones de Moodle más rápido.",
    introduction:
      "Un conjunto conectado de herramientas para trabajar con Moodle mediante asistentes de IA, terminales, scripts y servicios estándar, mientras Moodle mantiene el control.",
    imageAlt: "Una docente planifica un curso con apuntes y un portátil en un espacio de aprendizaje luminoso",
    imageCaption: "IA que acompaña tu forma de enseñar",
    outcomes: [
      "Crear y mantener contenido de Moodle mediante acciones explícitas que respetan los permisos.",
      "Elegir entre el plugin de MoodlIA o los servicios web estándar de Moodle.",
      "Dar a los asistentes de IA instrucciones reutilizables para trabajar con Moodle de forma segura y portable.",
    ],
  },
  "teaching-tools": {
    title: "Haz que la enseñanza fluya",
    shortTitle: "Herramientas docentes",
    description: "Crea rúbricas, revisa trabajos y ofrece comentarios útiles con menos tareas repetitivas.",
    introduction:
      "Herramientas de navegador enfocadas que acompañan al profesorado dentro de las páginas de Moodle que ya utiliza, reduciendo tareas repetitivas sin sustituir su criterio.",
    imageAlt: "Una docente revisa con calma trabajos y tarjetas de retroalimentación",
    imageCaption: "Más tiempo para enseñar con criterio",
    outcomes: [
      "Importar rúbricas completas desde un archivo CSV sencillo a Moodle.",
      "Revisar sugerencias de corrección asistidas por IA antes de que lleguen a Moodle.",
      "Usar cada extensión únicamente en las páginas de Moodle donde resulta útil.",
    ],
  },
  "learning-insights": {
    title: "Descubre qué necesita atención",
    shortTitle: "Información del aprendizaje",
    description: "Convierte la actividad del curso en prioridades claras, señales útiles y apoyo a tiempo.",
    introduction:
      "Herramientas web y de escritorio que organizan la actividad, los plazos, la participación, las tendencias de calificaciones y el riesgo en vistas sobre las que el profesorado puede actuar.",
    imageAlt: "Una docente revisa un resumen de aprendizaje y tres marcadores de prioridad",
    imageCaption: "Claridad para decidir el siguiente apoyo",
    outcomes: [
      "Consultar cursos, plazos, recursos y acciones directas en una única vista docente.",
      "Identificar tendencias de participación y estudiantes que podrían necesitar apoyo.",
      "Elegir entre un flujo de análisis en el navegador o una aplicación independiente.",
    ],
  },
};

const spanishProducts: Record<string, ProductCopy> = {
  "moodle-plugin": {
    kind: "Plugin local de Moodle",
    status: "Proyecto de código abierto",
    description: "Ofrece a herramientas de IA autorizadas acceso controlado a acciones y contenido de Moodle.",
    introduction:
      "La base del servidor para automatizar Moodle de forma controlada. Expone operaciones explícitas mediante REST y un endpoint MCP alojado en Moodle, manteniendo los permisos y registros de Moodle como fuente de autoridad.",
    highlights: [
      "Servicios REST y un endpoint MCP alojado en Moodle",
      "Operaciones para cursos, actividades, bancos de preguntas, matriculaciones, archivos, auditorías y copias de seguridad",
      "Flujos que respetan los permisos y no eluden Moodle",
    ],
    bestFor: [
      "Equipos que conectan asistentes de IA directamente con Moodle",
      "Administradores que automatizan tareas repetitivas de creación de cursos",
      "Desarrolladores que crean flujos controlados para Moodle",
    ],
    requirements: [
      "Un sitio Moodle donde se pueda instalar un plugin local",
      "Un usuario de servicios y un token autorizados en Moodle",
      "Solo los permisos necesarios para el flujo previsto",
    ],
    sourceLabel: "Ver el plugin en GitHub",
    secondaryLabel: "Consultar o comunicar una incidencia",
  },
  cli: {
    kind: "Cliente de línea de comandos y Node",
    status: "Paquete npm publicado",
    description: "Ejecuta tareas de Moodle desde una terminal o un flujo repetible.",
    introduction:
      "La herramienta pública de línea de comandos y el cliente Node reutilizable para el plugin de MoodlIA. Lleva el mismo contrato de operaciones a equipos de desarrollo, scripts y procesos de automatización.",
    highlights: [
      "Se conecta directamente con MoodlIA mediante REST",
      "Disponible como comando global o dependencia de proyecto",
      "Incluye un cliente reutilizable y declaraciones TypeScript generadas",
    ],
    bestFor: [
      "Personas que prefieren la terminal para tareas repetibles de Moodle",
      "Scripts que crean, inspeccionan o auditan contenido de cursos",
      "Procesos de automatización que necesitan el cliente público de MoodlIA",
    ],
    requirements: [
      "Node.js 22 o posterior",
      "Un sitio Moodle con el plugin de MoodlIA instalado",
      "Un token REST habilitado para el servicio de MoodlIA",
    ],
    sourceLabel: "Ver la CLI en GitHub",
    secondaryLabel: "Abrir el paquete npm",
  },
  "moodle-core-cli": {
    kind: "Cliente de línea de comandos y Node",
    status: "Paquete npm publicado",
    description: "Trabaja con los servicios web estándar de Moodle sin instalar un plugin.",
    introduction:
      "Un cliente y una interfaz de línea de comandos accesibles para los servicios web del núcleo de Moodle 5.0 y posteriores. Convierte los detalles complejos de REST en operaciones estables sin requerir el plugin de MoodlIA.",
    highlights: [
      "Utiliza únicamente los servicios web del núcleo de Moodle",
      "Gestiona parámetros anidados, comprobaciones de versión y normalización de respuestas",
      "Expone operaciones claras en lugar de llamadas remotas arbitrarias",
    ],
    bestFor: [
      "Sitios Moodle donde no se puede instalar un plugin adicional",
      "Desarrolladores que necesitan un cliente tipado para los servicios del núcleo",
      "Automatizaciones controladas basadas en las capacidades estándar de Moodle",
    ],
    requirements: [
      "Node.js 22 o posterior",
      "Moodle 5.0 o posterior con los servicios web REST habilitados",
      "Un token cuyo servicio exponga cada función de Moodle necesaria",
    ],
    sourceLabel: "Ver Moodle Core CLI en GitHub",
    secondaryLabel: "Abrir el paquete npm",
  },
  skills: {
    kind: "Skills reutilizables para agentes de IA",
    status: "Proyecto de código abierto",
    description: "Guía a los asistentes de IA al crear y gestionar contenido de Moodle.",
    introduction:
      "Un conjunto reutilizable de skills para Codex destinado a operar Moodle mediante MoodlIA y diseñar contenido accesible que siga siendo portable con las copias de seguridad y restauraciones habituales de Moodle.",
    highlights: [
      "Guía para inspeccionar, crear, actualizar, publicar y verificar entidades de Moodle",
      "HTML portable y contenido interactivo diseñado para los flujos habituales de Moodle",
      "Validación frente a paquetes inseguros o dependientes de servicios remotos",
    ],
    bestFor: [
      "Docentes que trabajan con un asistente de IA en contenido de Moodle",
      "Equipos que necesitan un comportamiento de agentes repetible y documentado",
      "Contenido de cursos que debe seguir siendo portable sin MoodlIA en tiempo de ejecución",
    ],
    requirements: [
      "Codex o un entorno compatible capaz de cargar skills reutilizables",
      "Interfaces públicas de MoodlIA para operar Moodle",
    ],
    sourceLabel: "Ver las skills en GitHub",
  },
  rubrics: {
    kind: "Extensión de navegador",
    status: "Proyecto de código abierto",
    description: "Importa rúbricas completas de Moodle desde un sencillo archivo CSV.",
    introduction:
      "Una extensión de navegador específica que convierte una rúbrica CSV en el editor de rúbricas de Moodle, evitando la introducción manual repetitiva y permitiendo revisarla y editarla con normalidad.",
    highlights: [
      "Importa criterios y niveles de rúbrica desde CSV",
      "Se ejecuta únicamente en sitios Moodle compatibles o aprobados expresamente",
      "Utiliza un analizador CSV nativo sin dependencias externas en tiempo de ejecución",
    ],
    bestFor: [
      "Docentes que preparan rúbricas detalladas de calificación en Moodle",
      "Equipos que trasladan tablas de rúbricas existentes a Moodle",
      "Configuración repetida de rúbricas en cursos o sitios",
    ],
    requirements: [
      "Chrome u otro navegador basado en Chromium",
      "Acceso a una página de edición de rúbricas de Moodle",
      "Un archivo CSV de rúbrica con la estructura correcta",
    ],
    sourceLabel: "Ver MoodlIA Rubrics en GitHub",
  },
  corrector: {
    kind: "Extensión de Chrome",
    status: "Proyecto de código abierto",
    description: "Sugiere comentarios para tareas y aplica únicamente las correcciones aprobadas por el docente.",
    introduction:
      "Una extensión de Chrome para revisar entregas de tareas de Moodle con ayuda de IA. Las sugerencias permanecen bajo el control del docente antes de aplicarse a los formularios de calificación de Moodle.",
    highlights: [
      "Funciona en las páginas de calificación de tareas de Moodle",
      "Normaliza las sugerencias de corrección y la información de las rúbricas",
      "Requiere la aprobación del docente antes de aplicar los cambios sugeridos",
    ],
    bestFor: [
      "Docentes que revisan muchas entregas de tareas en Moodle",
      "Evaluación con rúbricas y comentarios coherentes",
      "Educadores que quieren ayuda de IA sin decisiones automáticas de calificación",
    ],
    requirements: [
      "Google Chrome",
      "Acceso a una página de calificación de tareas de Moodle",
      "Una conexión configurada con un AI Runtime externo",
    ],
    sourceLabel: "Ver MoodlIA Corrector en GitHub",
  },
  "chrome-extensions": {
    kind: "Familia de herramientas de navegador",
    status: "Familia de proyectos",
    description: "Lleva herramientas específicas de MoodlIA a las páginas de Moodle que ya utiliza el profesorado.",
    introduction:
      "La parte de navegador de MoodlIA mantiene cada herramienta cerca de la tarea de Moodle a la que ayuda. Las extensiones solicitan únicamente el acceso que necesitan y no sustituyen el flujo docente de Moodle.",
    highlights: [
      "Herramientas específicas en lugar de una única extensión sobredimensionada",
      "Acceso limitado a sitios Moodle compatibles o aprobados por el docente",
      "Los proyectos actuales incluyen MoodlIA Rubrics y MoodlIA Corrector",
    ],
    bestFor: [
      "Docentes que quieren ayuda directamente dentro de Moodle",
      "Centros que prefieren pequeñas herramientas específicas",
      "Flujos en los que Moodle sigue siendo el lugar visible de trabajo",
    ],
    requirements: [
      "Chrome u otro navegador compatible basado en Chromium",
      "Permiso para instalar la extensión elegida",
      "Acceso a la página de edición o calificación correspondiente de Moodle",
    ],
    sourceLabel: "Explorar los proyectos de MoodlIA en GitHub",
  },
  "teacher-dashboard": {
    kind: "Panel web",
    status: "Proyecto de código abierto",
    description: "Reúne cursos, plazos, recursos y enlaces directos en una única vista docente.",
    introduction:
      "Un panel sin backend propio que se conecta directamente a los servicios REST de Moodle desde el navegador y organiza la información necesaria para el seguimiento diario de los cursos.",
    highlights: [
      "Reúne cursos, fechas de actuación, recursos y enlaces de Moodle",
      "Funciona completamente en el navegador sin un backend personalizado",
      "Guarda la configuración de conexión localmente en el dispositivo",
    ],
    bestFor: [
      "Docentes que trabajan con varios cursos de Moodle",
      "Revisiones diarias rápidas de plazos y recursos del curso",
      "Sitios que permiten acceder desde el navegador a los servicios REST de Moodle",
    ],
    requirements: [
      "Servicios web REST habilitados en Moodle",
      "Un token con las funciones necesarias de cursos y calendario",
      "Un sitio Moodle cuya política CORS permita peticiones desde el navegador",
    ],
    sourceLabel: "Ver el panel en GitHub",
  },
  "analyzer-web": {
    kind: "Aplicación web",
    status: "Proyecto de código abierto",
    description: "Detecta tendencias de participación, riesgo del alumnado y prioridades desde el navegador.",
    introduction:
      "Un espacio de análisis de Moodle exclusivamente frontend para el seguimiento de cursos y estudiantes. Combina actividad, participación, calificaciones, riesgo, recomendaciones y prioridades de intervención sin un backend propio.",
    highlights: [
      "Análisis del curso, riesgo del alumnado, recomendaciones y colas de intervención",
      "Comparación de tendencias, gráficos, filtros y exportación CSV o JSON",
      "Perfiles locales y caché de análisis guardados en el navegador",
    ],
    bestFor: [
      "Docentes que quieren un análisis profundo del curso sin instalar software de escritorio",
      "Seguimiento del alumnado basado en actividad, participación y calificaciones",
      "Flujos de análisis bilingües en inglés y español",
    ],
    requirements: [
      "Un navegador web moderno",
      "Acceso REST a Moodle y un token adecuado",
      "Un puente de navegador opcional si Moodle bloquea las peticiones entre sitios",
    ],
    sourceLabel: "Ver Analyzer Web en GitHub",
  },
  "analyzer-desktop": {
    kind: "Aplicación de escritorio",
    status: "Proyecto de código abierto",
    description: "Ofrece análisis de cursos en una aplicación de escritorio independiente.",
    introduction:
      "Una aplicación independiente para analizar la actividad del curso, la participación, las tendencias de calificaciones y el riesgo de seguimiento, con paneles de curso, vistas de estudiantes, gráficos e informes opcionales asistidos por IA.",
    highlights: [
      "Paneles de curso y vistas detalladas del alumnado",
      "Umbral de aprobado configurable y clasificación de riesgo conservadora",
      "Perfiles de conexión locales con contraseñas conservadas únicamente en memoria",
    ],
    bestFor: [
      "Docentes que prefieren un espacio de trabajo de escritorio dedicado",
      "Análisis de cursos y estudiantes con amplio detalle visual",
      "Flujos de trabajo en Windows y Mac con Apple Silicon",
    ],
    requirements: [
      "Una versión compatible para Windows o Mac con Apple Silicon",
      "Acceso a los servicios web REST de Moodle",
      "Un token o credenciales para solicitar uno durante la sesión",
    ],
    sourceLabel: "Ver Analyzer Desktop en GitHub",
    secondaryLabel: "Abrir las versiones disponibles",
  },
};

export const interfaceCopy = {
  en: {
    language: "Language",
    viewEnglish: "View in English",
    viewSpanish: "View in Spanish",
    homeLabel: "MoodlIA home",
    navigation: "Main navigation",
    waysNav: "Three ways",
    helpNav: "Get help",
    contact: "Contact",
    footerTagline: "Help, chosen for the moment you need it",
    skip: "Skip to main content",
    home: "Home",
    meetProjects: "Meet the projects",
    partsTitle: "What is in this selection.",
    unlocksTitle: "What becomes easier.",
    exploreProduct: "Explore",
    askAboutProject: "Ask about this project",
    projectSummary: "project summary",
    builtForTitle: "Here for one clear job.",
    helpsWithTitle: "What it helps with",
    fitTitle: "A good fit for",
    requirementsTitle: "What you need",
    connectedTitle: "Keep exploring.",
    exploreAllPrefix: "Explore all",
    exploreAllSuffix: "projects",
    helpTitlePrefix: "Want help with",
    helpBody: "Tell us what you are trying to achieve. We can help you choose, start, configure, or troubleshoot the right MoodlIA project.",
    writeTo: "Write to contact@moodlia.com",
    homePage: {
      title: ["Moodle,", "made easier.", "Three ways."],
      intro: "A carefully chosen family of projects for the teaching moment you are in.",
      explore: "Find your way",
      ask: "Ask us anything",
      note: "Made for real Moodle work · Help when you need it",
      movementsTitle: "What would help today?",
      movementsBody: "Choose the moment that feels closest. Each one opens a small, focused selection of MoodlIA projects.",
      exploreWay: "Open this selection",
      helpTitle: "We can help you put it together.",
      helpBody: "Tell us what is getting in the way. We can help you choose, begin, solve a problem, or shape something new around MoodlIA.",
      helpMechanism: "A real conversation, from the first message.",
    },
  },
  es: {
    language: "Idioma",
    viewEnglish: "Ver en inglés",
    viewSpanish: "Ver en español",
    homeLabel: "Inicio de MoodlIA",
    navigation: "Navegación principal",
    waysNav: "Tres formas",
    helpNav: "Ayuda",
    contact: "Contacto",
    footerTagline: "La ayuda adecuada para el momento que necesitas",
    skip: "Saltar al contenido principal",
    home: "Inicio",
    meetProjects: "Conoce los proyectos",
    partsTitle: "Qué incluye esta selección.",
    unlocksTitle: "Lo que se vuelve más fácil.",
    exploreProduct: "Descubre",
    askAboutProject: "Pregunta por este proyecto",
    projectSummary: "resumen del proyecto",
    builtForTitle: "Creado para facilitar una tarea concreta.",
    helpsWithTitle: "En qué te ayuda",
    fitTitle: "Ideal para",
    requirementsTitle: "Qué necesitas",
    connectedTitle: "Sigue descubriendo.",
    exploreAllPrefix: "Descubre todos los proyectos de",
    exploreAllSuffix: "",
    helpTitlePrefix: "¿Necesitas ayuda con",
    helpBody: "Cuéntanos qué quieres conseguir. Te ayudaremos a elegir, empezar, configurar o resolver problemas con el proyecto de MoodlIA adecuado.",
    writeTo: "Escribe a contact@moodlia.com",
    homePage: {
      title: ["Moodle,", "más fácil.", "Tres formas."],
      intro: "Una familia de proyectos elegidos con cuidado para el momento docente en el que estás.",
      explore: "Encuentra tu forma",
      ask: "Cuéntanos qué necesitas",
      note: "Creado para el trabajo real en Moodle · Ayuda cuando la necesites",
      movementsTitle: "¿Qué te ayudaría hoy?",
      movementsBody: "Elige el momento que más se parece al tuyo. Cada uno abre una pequeña selección de proyectos MoodlIA.",
      exploreWay: "Abre esta selección",
      helpTitle: "Te ayudamos a encajarlo todo.",
      helpBody: "Cuéntanos qué se está interponiendo. Podemos ayudarte a elegir, empezar, resolver un problema o dar forma a algo nuevo con MoodlIA.",
      helpMechanism: "Una conversación real desde el primer mensaje.",
    },
  },
} as const;

export function localizePath(locale: Locale, path: string) {
  if (locale === "en") return path;
  return path === "/" ? "/es" : `/es${path}`;
}

export function getLocalizedWays(locale: Locale) {
  if (locale === "en") return ways;
  return ways.map((way) => ({ ...way, ...spanishWays[way.slug] }));
}

export function getLocalizedProducts(locale: Locale) {
  if (locale === "en") return products;
  return products.map((product) => ({ ...product, ...spanishProducts[product.slug] }));
}

export function getLocalizedWay(slug: string, locale: Locale) {
  return getLocalizedWays(locale).find((way) => way.slug === slug);
}

export function getLocalizedProduct(slug: string, locale: Locale) {
  return getLocalizedProducts(locale).find((product) => product.slug === slug);
}

export function getLocalizedWayProducts(waySlug: WaySlug, locale: Locale) {
  const way = getLocalizedWay(waySlug, locale);
  if (!way) return [];
  return way.productSlugs
    .map((slug) => getLocalizedProduct(slug, locale))
    .filter((product): product is MoodliaProduct => Boolean(product));
}

export function getLocalizedRelatedProducts(product: MoodliaProduct, locale: Locale) {
  return getLocalizedWayProducts(product.waySlug, locale).filter(
    (candidate) => candidate.slug !== product.slug,
  );
}
