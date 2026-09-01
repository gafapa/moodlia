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
  | "startGuide"
  | "sourceLabel"
> & Partial<Pick<MoodliaProduct, "secondaryLabel">>;

export interface PracticalGuideStep {
  title: string;
  description: string;
  command?: string;
  action?: {
    href: string;
    label: string;
  };
}

export interface PracticalGuide {
  title: string;
  introduction: string;
  availability?: {
    title: string;
    description: string;
  };
  steps: PracticalGuideStep[];
}

const spanishWays: Record<WaySlug, WayCopy> = {
  "ai-integration": {
    title: "Convierte ideas en aprendizaje en Moodle",
    shortTitle: "Planifica con IA",
    description: "Da forma a un curso, una actividad o una mejora con ayuda de IA y decide qué llega a Moodle.",
    introduction:
      "Formas prácticas de convertir una idea docente en contenido de Moodle, manteniendo el control de tu sitio, sus permisos y tu criterio profesional.",
    imageAlt: "Una docente planifica un curso con apuntes y un portátil en un espacio de aprendizaje luminoso",
    imageCaption: "IA que acompaña tu forma de enseñar",
    outcomes: [
      "Preparar y mejorar contenido de Moodle sin partir de una página en blanco en cada tarea.",
      "Usar el asistente de IA o el flujo de trabajo que encaje con tu centro y tu forma de trabajar.",
      "Revisar cada cambio propuesto antes de incorporarlo a un curso real.",
    ],
  },
  "teaching-tools": {
    title: "Dedica más tiempo a enseñar",
    shortTitle: "Enseña con facilidad",
    description: "Prepara rúbricas, revisa trabajos y ofrece comentarios útiles con menos tareas repetitivas.",
    introduction:
      "Herramientas enfocadas que ayudan en las partes de la docencia con Moodle que más tiempo consumen, sin sustituir ninguna decisión de enseñanza o calificación.",
    imageAlt: "Una docente revisa con calma trabajos y tarjetas de retroalimentación",
    imageCaption: "Más tiempo para enseñar con criterio",
    outcomes: [
      "Llevar una rúbrica completa a Moodle sin introducir cada nivel a mano.",
      "Usar sugerencias de comentarios como punto de partida y aprobar solo lo que quieres decir.",
      "Trasladar una copia de curso a un Moodle anterior sin enviarla a un servidor.",
    ],
  },
  "learning-insights": {
    title: "Sabe dónde ayudar después",
    shortTitle: "Ve lo importante",
    description: "Convierte la actividad del curso en prioridades claras para ofrecer apoyo en el momento adecuado.",
    introduction:
      "Vistas claras del curso que reúnen actividad, plazos, participación y progreso para que sea más fácil detectar la siguiente conversación útil.",
    imageAlt: "Una docente revisa un resumen de aprendizaje y tres marcadores de prioridad",
    imageCaption: "Claridad para decidir el siguiente apoyo",
    outcomes: [
      "Ver en un solo lugar los cursos, plazos y recursos que necesitan atención.",
      "Detectar con cuidado patrones de participación y progreso que merece la pena seguir.",
      "Elegir una vista sencilla o un análisis más profundo cuando lo necesites.",
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
    startGuide: {
      install: [
        "Pide a la persona que administra tu sitio Moodle que instale este plugin una única vez para todo el sitio.",
        "Pídele que cree una cuenta de servicio MoodlIA independiente, con acceso limitado y un token para lo que necesitas hacer.",
        "Guarda en privado la dirección de Moodle y el token; nunca compartas una contraseña de administrador.",
      ],
      firstUse: [
        "Empieza con una tarea pequeña en un curso de prueba o una copia del curso.",
        "Úsalo desde una herramienta complementaria, como MoodlIA CLI o un asistente de IA autorizado.",
        "Revisa cada cambio que se proponga en Moodle antes de confirmarlo.",
      ],
      adminNote: "Esta es la base que instala un administrador de Moodle. El profesorado normalmente la utiliza desde otra herramienta MoodlIA.",
    },
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
    startGuide: {
      install: [
        "Pide a una persona familiarizada con herramientas de línea de comandos que instale MoodlIA CLI en el ordenador que vas a usar.",
        "Dale la dirección de Moodle y un token REST de MoodlIA específico proporcionado por el administrador de Moodle.",
        "Mantén ese token en privado y usa un curso de prueba para tu primera conexión.",
      ],
      firstUse: [
        "Abre la herramienta de comandos y comprueba que puede leer tu sitio Moodle.",
        "Prueba una tarea pequeña y reversible, como listar un curso o crear un elemento de borrador.",
        "Comprueba el resultado en Moodle antes de repetir el flujo.",
      ],
      adminNote: "Es una herramienta de terminal. No tienes que aprenderla en solitario: una persona de Moodle o informática puede hacer contigo la configuración inicial.",
    },
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
    startGuide: {
      install: [
        "Pide al administrador de Moodle que active los servicios REST estándar necesarios para tu tarea.",
        "Pide a una persona que use herramientas de línea de comandos que instale Moodle Core CLI en tu ordenador.",
        "Utiliza un token independiente con solo las funciones de Moodle que necesitas.",
      ],
      firstUse: [
        "Primero confirma que la herramienta puede leer tu sitio Moodle.",
        "Prueba una tarea pequeña en un curso de prueba antes de cambiar un curso real.",
        "Revisa el resultado en Moodle después de cada flujo nuevo.",
      ],
      adminNote: "Es una buena opción cuando tu sitio Moodle no puede instalar el plugin de MoodlIA. Aun así, un administrador debe preparar el acceso de forma segura.",
    },
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
    startGuide: {
      install: [
        "Elige un espacio de trabajo de IA que pueda utilizar skills reutilizables, como Codex.",
        "Pide a la persona que administra ese espacio que añada la colección MoodlIA Skills.",
        "Conecta el espacio con Moodle solo mediante una configuración MoodlIA o Moodle Core aprobada.",
      ],
      firstUse: [
        "Cuéntale al asistente, con tus palabras, qué quieres preparar.",
        "Empieza por una única página, sección o actividad en lugar de por un curso entero.",
        "Lee el contenido propuesto y apruébalo antes de publicarlo en Moodle.",
      ],
      adminNote: "Las skills orientan a un asistente de IA; por sí solas no le dan acceso. El acceso a Moodle sigue dependiendo de la conexión que elijas.",
    },
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
    startGuide: {
      install: [
        "Utiliza Chrome u otro navegador basado en Chromium.",
        "Pide a una persona de confianza que añada la extensión MoodlIA Rubrics al perfil de navegador que usas para Moodle.",
        "Prepara tu rúbrica en la plantilla CSV sencilla antes de abrir Moodle.",
      ],
      firstUse: [
        "Abre la página de edición de rúbricas en Moodle.",
        "Elige tu archivo CSV y deja que la extensión complete el borrador de la rúbrica.",
        "Lee y ajusta los criterios en Moodle antes de guardar la rúbrica.",
      ],
      adminNote: "La extensión funciona dentro del navegador y no sustituye al editor de rúbricas de Moodle. Tú mantienes el control de la rúbrica final.",
    },
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
      "Google Chrome 116 o posterior",
      "Acceso a una página HTTPS de calificación de tareas de Moodle",
      "Un servicio Ollama local o un proveedor compatible con OpenAI aprobado por tu centro o equipo",
    ],
    startGuide: {
      install: [
        "Instala MoodlIA Corrector desde Chrome Web Store en tu propio perfil de Chrome.",
        "Abre las opciones de la extensión y elige Ollama local o el proveedor compatible con OpenAI aprobado por tu centro o equipo.",
        "Abre Moodle como siempre con tu propia cuenta docente.",
      ],
      firstUse: [
        "Abre una entrega de tarea en la página de calificación de Moodle.",
        "Pide una sugerencia y léela junto al trabajo del estudiante y tu rúbrica.",
        "Aplica solamente las partes con las que estés de acuerdo y guarda tú mismo la calificación en Moodle.",
      ],
      adminNote: "Corrector propone comentarios; no toma decisiones de calificación por ti. No se aplica nada hasta que lo apruebas.",
    },
    sourceLabel: "Ver MoodlIA Corrector en GitHub",
  },
  "backup-converter": {
    kind: "Aplicación web",
    status: "Proyecto de código abierto",
    description: "Adapta copias modernas de Moodle para versiones anteriores seleccionadas sin subirlas.",
    introduction:
      "Una mesa de migración local para docentes y coordinadores de Moodle que necesitan reutilizar material de un curso en un sitio anterior. Inspecciona un archivo .mbz local, explica los riesgos de compatibilidad, pide permiso antes de eliminar actividades no admitidas y prepara la copia convertida íntegramente en el navegador.",
    highlights: [
      "Perfiles explícitos para Moodle 4.5, 4.1 y 3.11",
      "Mantiene la copia de origen en el navegador y nunca la sube",
      "Descarga el archivo .mbz convertido y un informe JSON auditable",
    ],
    bestFor: [
      "Docentes que trasladan cursos entre sitios Moodle con versiones diferentes",
      "Coordinadores que preparan una copia de trabajo para un sitio antiguo",
      "Comprobar incompatibilidades conocidas antes de intentar una restauración",
    ],
    requirements: [
      "Un navegador moderno con memoria suficiente para la copia descomprimida",
      "Una copia local .mbz de Moodle de hasta 768 MB",
      "Un curso de prueba en el Moodle de destino para la primera restauración",
    ],
    startGuide: {
      install: [
        "Abre la dirección estática de Backup Converter que facilite tu centro o equipo; no hay nada que instalar ni hace falta crear una cuenta.",
        "Conserva intacta la copia .mbz original y trabaja con un duplicado.",
        "Si la copia es grande, cierra otras pestañas del navegador que consuman mucha memoria.",
      ],
      firstUse: [
        "Elige la copia .mbz local y la versión anterior de Moodle que necesitas.",
        "Lee cada bloqueo y aprueba una eliminación únicamente cuando entiendas qué actividades se omitirán.",
        "Descarga la copia convertida y el informe JSON, y restáurala primero en un curso de prueba vacío.",
      ],
      adminNote: "La conversión es conservadora y auditable, pero no puede garantizar que todos los plugins de Moodle ni las estructuras modernas del banco de preguntas se restauren en un sitio anterior. Prueba siempre el resultado antes de utilizarlo.",
    },
    sourceLabel: "Ver Backup Converter en GitHub",
    secondaryLabel: "Abrir Backup Converter",
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
    startGuide: {
      install: [
        "Elige la herramienta de navegador que corresponde a tu tarea: Rubrics para preparar o Corrector para dar comentarios.",
        "Utiliza Chrome u otro navegador Chromium compatible.",
        "Pide a una persona de confianza que añada la extensión elegida a tu perfil de navegador.",
      ],
      firstUse: [
        "Abre la página de Moodle donde normalmente preparas o calificas trabajo.",
        "Usa primero la extensión para una tarea pequeña.",
        "Comprueba el resultado en Moodle antes de guardar o aplicar nada.",
      ],
      adminNote: "Cada extensión se concentra en una tarea de Moodle. Puedes preguntarnos cuál encaja con tu forma de trabajar antes de instalar nada.",
    },
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
    startGuide: {
      install: [
        "Pide al administrador de Moodle que prepare un token REST con acceso a cursos y calendario.",
        "Abre en un navegador moderno la dirección del panel que te facilite tu centro o equipo.",
        "Introduce la dirección de Moodle y el token en tu propio dispositivo; el panel guarda su configuración localmente.",
      ],
      firstUse: [
        "Comprueba que tus cursos y plazos aparecen correctamente.",
        "Abre un curso y usa sus enlaces directos de Moodle como lo haces habitualmente.",
        "Convierte el panel en parte de una revisión breve diaria o semanal.",
      ],
      adminNote: "El panel se conecta desde tu navegador directamente con Moodle. Tu sitio Moodle debe permitir esa conexión para poder sincronizar.",
    },
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
    startGuide: {
      install: [
        "Pide al administrador de Moodle un token REST adecuado.",
        "Abre en un navegador moderno la dirección de Analyzer Web que te facilite tu centro o equipo.",
        "Si se bloquea la conexión, pide a una persona de confianza que añada el puente de navegador opcional.",
      ],
      firstUse: [
        "Conecta un curso y espera a que termine el análisis.",
        "Empieza por la vista general del curso y por las prioridades sugeridas.",
        "Abre una vista de estudiante solo cuando estés listo para decidir un seguimiento útil.",
      ],
      adminNote: "Analyzer Web sirve para detectar cuestiones que merece la pena mirar, no para tomar decisiones automáticas sobre el alumnado.",
    },
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
    startGuide: {
      install: [
        "Elige la versión para Windows o Mac con Apple Silicon que corresponda a tu ordenador.",
        "Descarga la versión de escritorio aprobada o pide a tu centro o equipo que la instale por ti.",
        "Pide al administrador de Moodle el método de conexión aprobado por tu sitio.",
      ],
      firstUse: [
        "Abre la aplicación y conéctate a Moodle durante la sesión actual.",
        "Elige un curso y empieza por su vista general, no por los detalles individuales del alumnado.",
        "Utiliza el análisis para orientar una conversación o seguimiento y vuelve a Moodle para la siguiente acción.",
      ],
      adminNote: "La aplicación de escritorio conserva las contraseñas solo en memoria durante la sesión activa. Utiliza el método de conexión que apruebe tu sitio Moodle.",
    },
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
    startNav: "Start here",
    helpNav: "Get help",
    contact: "Contact",
    legalNotice: "Legal notice",
    privacy: "Privacy",
    cookies: "Cookies",
    footerTagline: "Practical help for everyday Moodle work",
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
    startHereTitle: "How installation and use work.",
    installTitle: "Set it up once",
    firstUseTitle: "Try one small thing",
    adminNoteTitle: "Good to know",
    startHereLink: "Get help to start this tool",
    seeHowToStart: "See installation and first-use steps",
    connectedTitle: "Keep exploring.",
    exploreAllPrefix: "Explore all",
    exploreAllSuffix: "projects",
    helpTitlePrefix: "Want help with",
    helpBody: "Tell us what you are trying to achieve. We can help you choose, start, configure, or troubleshoot the right MoodlIA project.",
    writeTo: "Write to contact@moodlia.com",
    homePage: {
      title: ["Make Moodle", "work for you.", "Three ways."],
      intro: "Practical help to plan learning, teach with more time, and know where to help next.",
      explore: "Find your starting point",
      exploreWays: "See the three ways",
      ask: "Ask us anything",
      note: "Free, open projects · Clear help whenever you need it",
      movementsTitle: "What would make Moodle easier today?",
      movementsBody: "Choose one practical goal. Each way brings together the MoodlIA projects that can help you move it forward.",
      exploreWay: "See how it helps",
      projectsToggle: "See the projects in this way",
      helpTitle: "Tell us what you want to make easier.",
      helpBody: "Whether you are planning a course, reviewing work, or trying to understand what needs attention, we can help you choose a useful next step with MoodlIA.",
      helpMechanism: "Human help, from the first message.",
    },
    startPage: {
      title: "A clear first step.",
      intro: "You do not need to be technical to begin with MoodlIA. Choose the teaching moment, start with one small task, and ask for help whenever you need it.",
      imageAlt: "A calm study desk with a notebook, pen and laptop ready for a first Moodle task",
      chooseTitle: "Start with the moment, not the tool.",
      chooseBody: "Choose what you would like to make easier. You will only see the projects that fit that moment.",
      startTitle: "A simple way to begin.",
      startSteps: [
        "Choose one small task you already do in Moodle.",
        "Open the project that fits and follow its plain-language steps.",
        "Try it in a test course or with one real task, then check the result in Moodle.",
      ],
      supportTitle: "You are not on your own.",
      supportBody: "Some tools need a Moodle administrator or a colleague for the one-time setup. That is normal. Tell us what you are trying to do and we will help you choose the next step.",
      supportAction: "Ask for help with MoodlIA",
      toolsTitle: "How each tool is installed and used.",
      toolsBody: "These short explanations tell you what happens before you start and what you do afterwards. Open a product for its complete step-by-step guide.",
      installLabel: "To install:",
      useLabel: "To use it:",
      openProductGuide: "Open the complete guide",
    },
  },
  es: {
    language: "Idioma",
    viewEnglish: "Ver en inglés",
    viewSpanish: "Ver en español",
    homeLabel: "Inicio de MoodlIA",
    navigation: "Navegación principal",
    waysNav: "Tres formas",
    startNav: "Empieza aquí",
    helpNav: "Ayuda",
    contact: "Contacto",
    legalNotice: "Aviso legal",
    privacy: "Privacidad",
    cookies: "Cookies",
    footerTagline: "Ayuda práctica para el Moodle de cada día",
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
    startHereTitle: "Cómo se instala y se utiliza.",
    installTitle: "Configúralo una vez",
    firstUseTitle: "Prueba una cosa pequeña",
    adminNoteTitle: "Conviene saberlo",
    startHereLink: "Pide ayuda para empezar con esta herramienta",
    seeHowToStart: "Ver cómo instalarla y utilizarla",
    connectedTitle: "Sigue descubriendo.",
    exploreAllPrefix: "Descubre todos los proyectos de",
    exploreAllSuffix: "",
    helpTitlePrefix: "¿Necesitas ayuda con",
    helpBody: "Cuéntanos qué quieres conseguir. Te ayudaremos a elegir, empezar, configurar o resolver problemas con el proyecto de MoodlIA adecuado.",
    writeTo: "Escribe a contact@moodlia.com",
    homePage: {
      title: ["Haz que Moodle", "trabaje contigo.", "Tres formas."],
      intro: "Ayuda práctica para planificar el aprendizaje, enseñar con más tiempo y saber dónde ayudar después.",
      explore: "Encuentra tu punto de partida",
      exploreWays: "Ve las tres formas",
      ask: "Cuéntanos qué necesitas",
      note: "Proyectos gratuitos y abiertos · Ayuda clara cuando la necesites",
      movementsTitle: "¿Qué haría Moodle más fácil hoy?",
      movementsBody: "Elige un objetivo práctico. Cada forma reúne los proyectos MoodlIA que pueden ayudarte a conseguirlo.",
      exploreWay: "Descubre cómo ayuda",
      projectsToggle: "Ver los proyectos de esta forma",
      helpTitle: "Cuéntanos qué quieres hacer más fácil.",
      helpBody: "Tanto si vas a planificar un curso como a revisar trabajos o entender qué necesita atención, podemos ayudarte a encontrar un siguiente paso útil con MoodlIA.",
      helpMechanism: "Ayuda humana desde el primer mensaje.",
    },
    startPage: {
      title: "Un primer paso claro.",
      intro: "No necesitas saber de tecnología para empezar con MoodlIA. Elige el momento docente, comienza con una tarea pequeña y pide ayuda siempre que la necesites.",
      imageAlt: "Una mesa de estudio tranquila con cuaderno, bolígrafo y portátil preparada para una primera tarea de Moodle",
      chooseTitle: "Empieza por el momento, no por la herramienta.",
      chooseBody: "Elige qué te gustaría hacer más fácil. Solo verás los proyectos que encajan con ese momento.",
      startTitle: "Una forma sencilla de empezar.",
      startSteps: [
        "Elige una tarea pequeña que ya haces en Moodle.",
        "Abre el proyecto que encaja y sigue sus pasos explicados con claridad.",
        "Pruébalo en un curso de prueba o con una tarea real y comprueba el resultado en Moodle.",
      ],
      supportTitle: "No estás solo.",
      supportBody: "Algunas herramientas necesitan que un administrador de Moodle o una persona de confianza haga la configuración inicial. Es normal. Cuéntanos qué quieres hacer y te ayudaremos a elegir el siguiente paso.",
      supportAction: "Pide ayuda con MoodlIA",
      toolsTitle: "Cómo se instala y se utiliza cada herramienta.",
      toolsBody: "Estas explicaciones breves te cuentan qué ocurre antes de empezar y qué haces después. Abre un producto para ver su guía completa paso a paso.",
      installLabel: "Para instalarla:",
      useLabel: "Para utilizarla:",
      openProductGuide: "Abrir la guía completa",
    },
  },
} as const;

const practicalGuides: Record<Locale, Record<string, PracticalGuide>> = {
  en: {
    "moodle-plugin": {
      title: "Install MoodlIA in Moodle",
      introduction: "This setup is completed once by a Moodle administrator. Afterwards, teachers and approved tools use their own Moodle permissions.",
      availability: {
        title: "Moodle Marketplace",
        description: "A public Marketplace listing is not available yet. Until then, install the plugin from its project download.",
      },
      steps: [
        { title: "Download the plugin", description: "Open the plugin project and download its ZIP file. Extract it so the folder is named moodlia.", action: { href: "https://github.com/gafapa/moodle-local_moodlia", label: "Download the MoodlIA plugin" } },
        { title: "Put it in Moodle", description: "Copy that folder to local/moodlia inside the Moodle installation, then run Moodle's upgrade.", command: "php admin/cli/upgrade.php --non-interactive\nphp admin/cli/purge_caches.php" },
        { title: "Create a limited service token", description: "In Site administration, enable web services, create the MoodlIA service, and give a dedicated service user only the capabilities needed. Create a token for that user; never use an administrator password." },
        { title: "Configure an MCP client", description: "Use the same Moodle REST token as a Bearer token. Modern stateless MCP clients and legacy lifecycle clients can use this one endpoint.", command: "URL: https://YOUR-MOODLE.example/local/moodlia/mcp.php\nAuthorization: Bearer YOUR_MOODLE_REST_TOKEN" },
      ],
    },
    cli: {
      title: "Install and run MoodlIA CLI",
      introduction: "Use this when you want repeatable Moodle tasks from a terminal. It connects through REST only; there is no MCP setting in the CLI.",
      availability: { title: "npm", description: "MoodlIA CLI is available as the published npm package moodlia." },
      steps: [
        { title: "Install it", description: "Install Node.js 22 or later, then run this once in PowerShell or Terminal.", command: "npm install -g moodlia", action: { href: "https://www.npmjs.com/package/moodlia", label: "Open MoodlIA CLI on npm" } },
        { title: "Add your Moodle connection", description: "Your Moodle administrator provides a limited MoodlIA REST token. Paste these values into the same PowerShell window; replace the example values.", command: "$env:MOODLE_BASE_URL = \"https://your-moodle.example\"\n$env:MOODLE_REST_TOKEN = \"your-token\"" },
        { title: "Check the connection", description: "This read-only command confirms that the CLI can reach Moodle with your account.", command: "moodlia get-current-user" },
        { title: "Try a small task", description: "Ask the command for its options, then begin in a test course. Check every result in Moodle.", command: "moodlia --help\nmoodlia get-courses --limit 10" },
      ],
    },
    "moodle-core-cli": {
      title: "Install and run Moodle Core CLI",
      introduction: "This is the plugin-free option. It uses Moodle's standard REST web services and needs a token prepared by your Moodle administrator.",
      availability: { title: "npm", description: "Moodle Core CLI is available as the published npm package moodle-core-cli." },
      steps: [
        { title: "Prepare standard Moodle access", description: "Ask your Moodle administrator to enable REST web services and give you a dedicated token with only the Moodle functions you need." },
        { title: "Set your connection", description: "In PowerShell, replace the two sample values with the Moodle address and token you were given.", command: "$env:MOODLE_BASE_URL = \"https://your-moodle.example\"\n$env:MOODLE_TOKEN = \"your-token\"" },
        { title: "Run the first check", description: "npx downloads and runs the package without a separate global installation.", command: "npx moodle-core-cli get-courses", action: { href: "https://www.npmjs.com/package/moodle-core-cli", label: "Open Moodle Core CLI on npm" } },
        { title: "Make changes deliberately", description: "Reading is the default. Any write operation must explicitly include --allow-write, so start by checking courses first." },
      ],
    },
    skills: {
      title: "Add MoodlIA Skills to an AI workspace",
      introduction: "Skills are guidance files for an approved AI workspace; they do not create Moodle access by themselves.",
      steps: [
        { title: "Open the Skills project", description: "Use the project instructions for the workspace you use, such as Codex.", action: { href: "https://github.com/gafapa/moodlia-skills", label: "Open MoodlIA Skills" } },
        { title: "Add the collection", description: "Ask the person who manages your AI workspace to add the collection using that workspace's skill-installation process." },
        { title: "Connect Moodle separately", description: "Choose either the MoodlIA REST setup, the independent MCP endpoint, or Moodle Core REST. Keep the token private." },
        { title: "Start with one request", description: "Ask the assistant to prepare one page, activity, or section. Review the proposal before anything is changed in Moodle." },
      ],
    },
    rubrics: {
      title: "Install MoodlIA Rubrics in Chrome",
      introduction: "This extension imports a CSV rubric into Moodle's normal rubric editor. You still review the rubric before saving it.",
      availability: { title: "Chrome Web Store", description: "A public Chrome Web Store listing is not available yet. The current installation uses the unpacked extension from the project download." },
      steps: [
        { title: "Download the extension", description: "Open the project, download the source ZIP, and extract it to a folder you will keep.", action: { href: "https://github.com/gafapa/moodlia-rubrics", label: "Download MoodlIA Rubrics" } },
        { title: "Open Chrome extensions", description: "Type this exact address in Chrome's address bar.", command: "chrome://extensions" },
        { title: "Load the extension", description: "Turn on Developer mode, choose Load unpacked, then select the extension folder inside the extracted project." },
        { title: "Import one rubric", description: "Open a Moodle rubric editing page, choose the CSV file, and check every criterion and level in Moodle before saving." },
      ],
    },
    corrector: {
      title: "Install MoodlIA Corrector in Chrome",
      introduction: "Corrector offers feedback suggestions on Moodle grading pages. A teacher reads and approves every change before it reaches Moodle.",
      availability: { title: "Chrome Web Store", description: "Install MoodlIA Corrector from the Chrome Web Store in your own Chrome profile." },
      steps: [
        { title: "Install from Chrome Web Store", description: "Open the store listing and select Add to Chrome in the browser profile you use for Moodle.", action: { href: "https://chromewebstore.google.com/detail/lppkkhjfjpjkaaacbjhillopodeekf", label: "Install MoodlIA Corrector" } },
        { title: "Open the extension options", description: "Choose the extension from Chrome's Extensions menu, then open Options. No developer mode is needed." },
        { title: "Configure your AI provider", description: "Choose local Ollama or an OpenAI-compatible provider approved by your school or team. An API key is kept only for the current browser session; do not use a personal key in a shared profile." },
        { title: "Review one submission", description: "Open a Moodle assignment grading page, request a suggestion, and apply only the feedback and marks you agree with." },
      ],
    },
    "backup-converter": {
      title: "Convert a Moodle backup in your browser",
      introduction: "Backup Converter works locally with a copy of your .mbz file. No account, upload, Moodle token, or server connection is required.",
      availability: { title: "Static web application", description: "Your school or team provides the web address. All inspection and conversion work stays in the browser." },
      steps: [
        { title: "Protect the original", description: "Make a copy of the original .mbz backup and keep the untouched file somewhere safe." },
        { title: "Choose the destination", description: "Open Backup Converter, select the working copy, and choose Moodle 4.5, 4.1, or 3.11.", action: { href: "/tools/backup-converter/", label: "Open Backup Converter" } },
        { title: "Review compatibility decisions", description: "Read the inspection report. Approve removal only for activities you accept losing from the converted copy." },
        { title: "Download and test", description: "Keep the converted .mbz and its JSON report together, then restore first into an empty test course on the destination site." },
      ],
    },
    "chrome-extensions": {
      title: "Choose and install a Chrome extension",
      introduction: "Use Rubrics to prepare a grading rubric and Corrector to review assignment feedback. They are separate extensions, so install only the one you need.",
      availability: { title: "Choose an extension", description: "Corrector is available in the Chrome Web Store. Rubrics is currently installed from its project download." },
      steps: [
        { title: "Choose the right tool", description: "Choose Rubrics for a CSV rubric import, or Corrector for teacher-approved feedback suggestions." },
        { title: "Download its project", description: "Open the chosen product page, download the source ZIP, and extract it." },
        { title: "Load it in Chrome", description: "Open this address, turn on Developer mode, click Load unpacked, and select its extension folder.", command: "chrome://extensions" },
        { title: "Use it inside Moodle", description: "Start with one small real task and review the Moodle result before saving or applying anything." },
      ],
    },
    "teacher-dashboard": {
      title: "Start using the Teacher Dashboard",
      introduction: "The dashboard opens in a browser and connects directly to Moodle. It needs a school-approved dashboard address and a limited Moodle REST token.",
      steps: [
        { title: "Ask for the dashboard address", description: "Your school or team needs to provide the dashboard link; it is not a public hosted service." },
        { title: "Prepare a Moodle token", description: "Ask the Moodle administrator for a dedicated REST token with course and calendar access." },
        { title: "Connect on your own device", description: "Open the dashboard, enter the Moodle address and token, then confirm that your courses and deadlines appear correctly." },
        { title: "Use it for a short check-in", description: "Open one course from its direct Moodle link and use the dashboard to decide what needs your attention today." },
      ],
    },
    "analyzer-web": {
      title: "Start using Analyzer Web",
      introduction: "Analyzer Web is supplied by your school or team and works in the browser with Moodle REST access.",
      steps: [
        { title: "Ask for the web address", description: "Your school or team needs to provide the Analyzer Web address; it is not a public hosted service." },
        { title: "Prepare Moodle access", description: "Ask for a limited REST token. If your Moodle blocks browser connections, ask whether the optional browser bridge is needed." },
        { title: "Connect one course", description: "Enter the requested connection details, choose one course, and wait for the analysis to finish." },
        { title: "Read the overview first", description: "Use suggested priorities to decide where a helpful follow-up may be needed; do not use it for automatic student decisions." },
      ],
    },
    "analyzer-desktop": {
      title: "Install Analyzer Desktop",
      introduction: "This is a standalone application for Windows and Apple Silicon Mac. Use a build approved by your school or team.",
      steps: [
        { title: "Choose the correct build", description: "Open the project builds and select the Windows or Apple Silicon Mac version that matches your computer.", action: { href: "https://github.com/gafapa/moodlia-analyzer-desktop/actions", label: "Open available builds" } },
        { title: "Install it", description: "Download the approved build and follow your organisation's normal application-installation policy." },
        { title: "Connect for this session", description: "Open the application and use the Moodle connection method approved by your administrator." },
        { title: "Begin with one course", description: "Start with the course overview, then use the analysis to guide a conversation or follow-up in Moodle." },
      ],
    },
  },
  es: {
    "moodle-plugin": {
      title: "Instala MoodlIA en Moodle",
      introduction: "Esta configuración la realiza una sola vez un administrador de Moodle. Después, el profesorado y las herramientas autorizadas usan sus propios permisos de Moodle.",
      availability: { title: "Moodle Marketplace", description: "Todavía no hay una ficha pública en Marketplace. Hasta entonces, instala el plugin desde su descarga de proyecto." },
      steps: [
        { title: "Descarga el plugin", description: "Abre el proyecto del plugin y descarga el ZIP. Extráelo de modo que la carpeta se llame moodlia.", action: { href: "https://github.com/gafapa/moodle-local_moodlia", label: "Descargar el plugin MoodlIA" } },
        { title: "Colócalo en Moodle", description: "Copia la carpeta en local/moodlia dentro de la instalación de Moodle y ejecuta la actualización.", command: "php admin/cli/upgrade.php --non-interactive\nphp admin/cli/purge_caches.php" },
        { title: "Crea un token limitado", description: "En Administración del sitio, activa los servicios web, crea el servicio MoodlIA y da a un usuario de servicio dedicado solo las capacidades necesarias. Crea su token; no uses nunca una contraseña de administrador." },
        { title: "Configura un cliente MCP", description: "Utiliza el mismo token REST de Moodle como token Bearer. Los clientes MCP modernos sin estado y los clientes heredados usan este mismo endpoint.", command: "URL: https://TU-MOODLE.example/local/moodlia/mcp.php\nAuthorization: Bearer TU_MOODLE_REST_TOKEN" },
      ],
    },
    cli: {
      title: "Instala y ejecuta MoodlIA CLI",
      introduction: "Úsala si quieres realizar tareas repetibles de Moodle desde una terminal. Se conecta solo por REST; la CLI no necesita ni configura MCP.",
      availability: { title: "npm", description: "MoodlIA CLI está disponible como paquete npm publicado con el nombre moodlia." },
      steps: [
        { title: "Instálala", description: "Instala Node.js 22 o posterior y ejecuta esto una vez en PowerShell o Terminal.", command: "npm install -g moodlia", action: { href: "https://www.npmjs.com/package/moodlia", label: "Abrir MoodlIA CLI en npm" } },
        { title: "Añade la conexión de Moodle", description: "Tu administrador proporciona un token REST limitado de MoodlIA. Pega estos valores en la misma ventana de PowerShell y sustituye los ejemplos.", command: "$env:MOODLE_BASE_URL = \"https://tu-moodle.example\"\n$env:MOODLE_REST_TOKEN = \"tu-token\"" },
        { title: "Comprueba la conexión", description: "Este comando de solo lectura confirma que la CLI puede llegar a Moodle con tu cuenta.", command: "moodlia get-current-user" },
        { title: "Prueba una tarea pequeña", description: "Pide las opciones del comando y empieza en un curso de prueba. Comprueba cada resultado dentro de Moodle.", command: "moodlia --help\nmoodlia get-courses --limit 10" },
      ],
    },
    "moodle-core-cli": {
      title: "Instala y ejecuta Moodle Core CLI",
      introduction: "Es la opción sin plugin. Utiliza los servicios web REST estándar de Moodle y necesita un token preparado por tu administrador de Moodle.",
      availability: { title: "npm", description: "Moodle Core CLI está disponible como paquete npm publicado con el nombre moodle-core-cli." },
      steps: [
        { title: "Prepara el acceso estándar de Moodle", description: "Pide al administrador de Moodle que active los servicios web REST y te dé un token dedicado con solo las funciones de Moodle que necesitas." },
        { title: "Define la conexión", description: "En PowerShell, sustituye los dos valores de ejemplo por la dirección de Moodle y el token que te hayan dado.", command: "$env:MOODLE_BASE_URL = \"https://tu-moodle.example\"\n$env:MOODLE_TOKEN = \"tu-token\"" },
        { title: "Ejecuta la primera comprobación", description: "npx descarga y ejecuta el paquete sin una instalación global independiente.", command: "npx moodle-core-cli get-courses", action: { href: "https://www.npmjs.com/package/moodle-core-cli", label: "Abrir Moodle Core CLI en npm" } },
        { title: "Haz cambios de forma deliberada", description: "La lectura es el modo predeterminado. Cualquier operación de escritura exige incluir --allow-write, así que empieza comprobando los cursos." },
      ],
    },
    skills: {
      title: "Añade MoodlIA Skills a un espacio de IA",
      introduction: "Las skills son archivos de guía para un espacio de IA aprobado; no dan acceso a Moodle por sí solas.",
      steps: [
        { title: "Abre el proyecto de Skills", description: "Usa las instrucciones del proyecto para el espacio de IA que utilices, como Codex.", action: { href: "https://github.com/gafapa/moodlia-skills", label: "Abrir MoodlIA Skills" } },
        { title: "Añade la colección", description: "Pide a quien administra tu espacio de IA que añada la colección siguiendo el proceso de instalación de skills de ese espacio." },
        { title: "Conecta Moodle por separado", description: "Elige la configuración REST de MoodlIA, el endpoint MCP independiente o Moodle Core REST. Guarda el token en privado." },
        { title: "Empieza con una petición", description: "Pide al asistente que prepare una sola página, actividad o sección. Revisa la propuesta antes de cambiar nada en Moodle." },
      ],
    },
    rubrics: {
      title: "Instala MoodlIA Rubrics en Chrome",
      introduction: "Esta extensión importa una rúbrica CSV en el editor normal de rúbricas de Moodle. Tú revisas la rúbrica antes de guardarla.",
      availability: { title: "Chrome Web Store", description: "Todavía no hay una ficha pública en Chrome Web Store. Por ahora se instala la extensión descomprimida desde la descarga del proyecto." },
      steps: [
        { title: "Descarga la extensión", description: "Abre el proyecto, descarga el ZIP del código y extráelo en una carpeta que vayas a conservar.", action: { href: "https://github.com/gafapa/moodlia-rubrics", label: "Descargar MoodlIA Rubrics" } },
        { title: "Abre las extensiones de Chrome", description: "Escribe esta dirección exacta en la barra de direcciones de Chrome.", command: "chrome://extensions" },
        { title: "Carga la extensión", description: "Activa el modo desarrollador, selecciona Cargar descomprimida y elige la carpeta extension dentro del proyecto extraído." },
        { title: "Importa una rúbrica", description: "Abre una página de edición de rúbricas de Moodle, elige el CSV y comprueba cada criterio y nivel en Moodle antes de guardar." },
      ],
    },
    corrector: {
      title: "Instala MoodlIA Corrector en Chrome",
      introduction: "Corrector propone comentarios en las páginas de calificación de Moodle. Un docente lee y aprueba cada cambio antes de que llegue a Moodle.",
      availability: { title: "Chrome Web Store", description: "Instala MoodlIA Corrector desde Chrome Web Store en tu propio perfil de Chrome." },
      steps: [
        { title: "Instálala desde Chrome Web Store", description: "Abre la ficha de la tienda y selecciona Añadir a Chrome en el perfil de navegador que utilizas con Moodle.", action: { href: "https://chromewebstore.google.com/detail/lppkkhjfjpjkaaacbjhillopodeekf", label: "Instalar MoodlIA Corrector" } },
        { title: "Abre las opciones de la extensión", description: "Elige la extensión en el menú Extensiones de Chrome y abre Opciones. No necesitas activar el modo desarrollador." },
        { title: "Configura tu proveedor de IA", description: "Elige Ollama local o un proveedor compatible con OpenAI aprobado por tu centro o equipo. La clave API se conserva solo durante la sesión del navegador; no uses una clave personal en un perfil compartido." },
        { title: "Revisa una entrega", description: "Abre la página de calificación de una tarea de Moodle, pide una sugerencia y aplica solo los comentarios y notas con los que estés de acuerdo." },
      ],
    },
    "backup-converter": {
      title: "Convierte una copia de Moodle en tu navegador",
      introduction: "Backup Converter trabaja localmente con un duplicado de tu archivo .mbz. No necesita cuenta, subida, token de Moodle ni conexión con un servidor.",
      availability: { title: "Aplicación web estática", description: "Tu centro o equipo proporciona la dirección web. Toda la inspección y la conversión permanecen en el navegador." },
      steps: [
        { title: "Protege el original", description: "Haz un duplicado de la copia .mbz original y conserva intacto el archivo de origen en un lugar seguro." },
        { title: "Elige el destino", description: "Abre Backup Converter, selecciona el duplicado y elige Moodle 4.5, 4.1 o 3.11.", action: { href: "/tools/backup-converter/", label: "Abrir Backup Converter" } },
        { title: "Revisa las decisiones de compatibilidad", description: "Lee el informe de inspección. Aprueba una eliminación solo para actividades que aceptes perder en la copia convertida." },
        { title: "Descarga y prueba", description: "Conserva juntos el .mbz convertido y su informe JSON, y restaura primero en un curso de prueba vacío del sitio de destino." },
      ],
    },
    "chrome-extensions": {
      title: "Elige e instala una extensión de Chrome",
      introduction: "Utiliza Rubrics para preparar una rúbrica y Corrector para revisar comentarios de tareas. Son extensiones independientes: instala solo la que necesites.",
      availability: { title: "Elige una extensión", description: "Corrector está disponible en Chrome Web Store. Rubrics se instala actualmente desde la descarga de su proyecto." },
      steps: [
        { title: "Elige la herramienta adecuada", description: "Elige Rubrics para importar una rúbrica CSV o Corrector para propuestas de comentarios que aprueba el docente." },
        { title: "Descarga su proyecto", description: "Abre la página del producto elegido, descarga el ZIP del código y extráelo." },
        { title: "Cárgala en Chrome", description: "Abre esta dirección, activa el modo desarrollador, pulsa Cargar descomprimida y selecciona la carpeta extension.", command: "chrome://extensions" },
        { title: "Úsala dentro de Moodle", description: "Empieza con una tarea real pequeña y comprueba el resultado en Moodle antes de guardar o aplicar nada." },
      ],
    },
    "teacher-dashboard": {
      title: "Empieza a utilizar Teacher Dashboard",
      introduction: "El panel se abre en un navegador y se conecta directamente con Moodle. Necesita una dirección de panel aprobada por el centro y un token REST limitado.",
      steps: [
        { title: "Pide la dirección del panel", description: "Tu centro o equipo debe facilitar la dirección del panel; no es un servicio público alojado." },
        { title: "Prepara un token de Moodle", description: "Pide al administrador de Moodle un token REST dedicado con acceso a cursos y calendario." },
        { title: "Conéctate en tu propio dispositivo", description: "Abre el panel, escribe la dirección de Moodle y el token, y confirma que aparecen tus cursos y plazos correctamente." },
        { title: "Úsalo para una revisión breve", description: "Abre un curso desde su enlace directo de Moodle y utiliza el panel para decidir qué necesita tu atención hoy." },
      ],
    },
    "analyzer-web": {
      title: "Empieza a utilizar Analyzer Web",
      introduction: "Analyzer Web lo proporciona tu centro o equipo y funciona en el navegador con acceso REST a Moodle.",
      steps: [
        { title: "Pide la dirección web", description: "Tu centro o equipo debe facilitar la dirección de Analyzer Web; no es un servicio público alojado." },
        { title: "Prepara el acceso a Moodle", description: "Pide un token REST limitado. Si Moodle bloquea las conexiones desde el navegador, consulta si es necesario el puente de navegador opcional." },
        { title: "Conecta un curso", description: "Introduce los datos de conexión solicitados, elige un curso y espera a que termine el análisis." },
        { title: "Lee primero la vista general", description: "Usa las prioridades sugeridas para decidir dónde puede hacer falta un seguimiento útil; no lo uses para tomar decisiones automáticas sobre el alumnado." },
      ],
    },
    "analyzer-desktop": {
      title: "Instala Analyzer Desktop",
      introduction: "Es una aplicación independiente para Windows y Mac con Apple Silicon. Utiliza una versión aprobada por tu centro o equipo.",
      steps: [
        { title: "Elige la versión correcta", description: "Abre las compilaciones del proyecto y selecciona la versión para Windows o Mac con Apple Silicon que corresponda a tu ordenador.", action: { href: "https://github.com/gafapa/moodlia-analyzer-desktop/actions", label: "Abrir las versiones disponibles" } },
        { title: "Instálala", description: "Descarga la versión aprobada y sigue la política normal de instalación de aplicaciones de tu organización." },
        { title: "Conéctate durante esta sesión", description: "Abre la aplicación y utiliza el método de conexión a Moodle que haya aprobado el administrador." },
        { title: "Comienza por un curso", description: "Empieza por la vista general del curso y utiliza el análisis para orientar una conversación o seguimiento dentro de Moodle." },
      ],
    },
  },
};

export function getPracticalGuide(slug: string, locale: Locale): PracticalGuide | undefined {
  return practicalGuides[locale][slug];
}

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
