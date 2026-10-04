// Single source of the site's product facts, in English and Spanish.
// Keep versions, requirements, and installation steps in step with each repository's README.

export type Locale = "en" | "es";
export type Text = Record<Locale, string>;

export type AppSlug =
  | "rubrics"
  | "backup-converter"
  | "edx-converter"
  | "teacher-dashboard"
  | "analyzer-web"
  | "moodle-plugin"
  | "cli"
  | "moodle-core-cli"
  | "sync"
  | "skills";

/** How much a person needs to know to install and use the app. */
export type Level = "browser" | "local" | "technical";

/** Where the app runs, which is also how the site groups installation. */
export type Place = "browser" | "computer" | "moodle" | "terminal" | "agent";

export interface Step {
  text: Text;
  code?: string;
}

export interface StepGroup {
  title: Text;
  steps: Step[];
}

export interface Link {
  label: Text;
  href: string;
}

export interface MoodliaApp {
  slug: AppSlug;
  name: string;
  place: Place;
  level: Level;
  status: "stable" | "preview";
  version?: string;
  summary: Text;
  description: Text;
  does: Text[];
  needs: Text[];
  /** The main way to get the app: a store, a package registry, or the hosted page. */
  get: Link;
  install: StepGroup[];
  firstUse: Step[];
  limits: Text[];
  docs: Link[];
  source: string;
  license: "GPL-3.0-or-later" | "MIT";
}

const t = (en: string, es: string): Text => ({ en, es });

export const apps: MoodliaApp[] = [
  {
    slug: "rubrics",
    name: "MoodlIA Rubrics",
    place: "browser",
    level: "browser",
    status: "stable",
    version: "1.2.1",
    summary: t(
      "Import a complete rubric into Moodle from a spreadsheet instead of typing every level by hand.",
      "Importa una rúbrica completa en Moodle desde una hoja de cálculo en lugar de escribir cada nivel a mano.",
    ),
    description: t(
      "A Chrome extension that fills Moodle's rubric editor from a CSV or Excel file. It works on assignment rubrics and on Workshop assessment forms that use the Rubric strategy, on any HTTPS Moodle. It is published in the Chrome Web Store as “Rubricando para Moodle”.",
      "Una extensión de Chrome que rellena el editor de rúbricas de Moodle a partir de un archivo CSV o Excel. Funciona en las rúbricas de las tareas y en los formularios de evaluación de los Talleres con la estrategia Rúbrica, en cualquier Moodle con HTTPS. Está publicada en la Chrome Web Store como «Rubricando para Moodle».",
    ),
    does: [
      t("Reads CSV and Excel .xlsx files (first worksheet).", "Lee archivos CSV y Excel .xlsx (la primera hoja)."),
      t("Creates every criterion, level, and score in the Moodle rubric editor.", "Crea todos los criterios, niveles y puntuaciones en el editor de rúbricas de Moodle."),
      t("Adds the extra Workshop level fields it needs, after asking you.", "Añade los campos de nivel que falten en un Taller, después de preguntarte."),
      t("Leaves the form open so you review it before saving.", "Deja el formulario abierto para que lo revises antes de guardar."),
    ],
    needs: [
      t("Chrome or another Chromium browser (Edge, Brave) on a computer.", "Chrome u otro navegador Chromium (Edge, Brave) en un ordenador."),
      t("Permission to edit the assignment or Workshop in Moodle.", "Permiso para editar la tarea o el Taller en Moodle."),
      t("A Moodle site served over HTTPS.", "Un Moodle servido por HTTPS."),
    ],
    get: {
      label: t("Add from the Chrome Web Store", "Añadir desde la Chrome Web Store"),
      href: "https://chromewebstore.google.com/detail/rubricando-para-moodle/ohicmoijcdaddlljgoaoocpjamfnmpgl",
    },
    install: [
      {
        title: t("Install the extension", "Instala la extensión"),
        steps: [
          { text: t("Open the “Rubricando para Moodle” page in the Chrome Web Store and select “Add to Chrome”.", "Abre la página «Rubricando para Moodle» en la Chrome Web Store y pulsa «Añadir a Chrome».") },
          { text: t("The extension asks for no access to any website when it is installed.", "Al instalarse, la extensión no pide acceso a ningún sitio web.") },
        ],
      },
    ],
    firstUse: [
      { text: t("Prepare the spreadsheet. Each criterion uses two rows: column A holds the criterion, the next columns hold one level each, and the row below holds each level's points.", "Prepara la hoja. Cada criterio ocupa dos filas: en la columna A va el criterio, en las siguientes columnas un nivel en cada una y en la fila de abajo los puntos de cada nivel."), code: "Criterion       | Insufficient | Adequate | Excellent\n                | 0            | 5        | 10" },
      { text: t("In Moodle, open the assignment's rubric editor (Advanced grading → Define rubric) or a Workshop assessment form with the Rubric strategy.", "En Moodle, abre el editor de rúbricas de la tarea (Calificación avanzada → Definir rúbrica) o el formulario de evaluación de un Taller con la estrategia Rúbrica.") },
      { text: t("Select the extension icon. The importer appears on that page; choose your file.", "Pulsa el icono de la extensión. El importador aparece en esa página; elige tu archivo.") },
      { text: t("Review the rubric and save it in Moodle. To skip the click on a site you use often, choose “Always activate on this site” in the icon menu.", "Revisa la rúbrica y guárdala en Moodle. Para no tener que pulsar el icono en un sitio que usas a menudo, elige «Activar siempre en este sitio» en el menú del icono.") },
    ],
    limits: [
      t("Old .xls workbooks are not supported; save them as .xlsx or CSV.", "No admite libros .xls antiguos; guárdalos como .xlsx o CSV."),
      t("Formulas are read from their last saved result: recalculate and save the workbook first.", "Las fórmulas se leen con su último resultado guardado: recalcula y guarda el libro antes."),
      t("Workshop grades must be different whole numbers from 0 to 100 within each criterion.", "En los Talleres, las puntuaciones de cada criterio deben ser números enteros distintos entre 0 y 100."),
    ],
    docs: [{ label: t("Spreadsheet format and permissions", "Formato de la hoja y permisos"), href: "https://github.com/gafapa/moodlia-rubrics#readme" }],
    source: "https://github.com/gafapa/moodlia-rubrics",
    license: "GPL-3.0-or-later",
  },
  {
    slug: "backup-converter",
    name: "MoodlIA Backup Converter",
    place: "browser",
    level: "browser",
    status: "stable",
    summary: t(
      "Adapt a Moodle course backup so it can be restored on an older Moodle site.",
      "Adapta una copia de seguridad de un curso de Moodle para restaurarla en un Moodle más antiguo.",
    ),
    description: t(
      "Moodle cannot restore a backup made on a newer version. Backup Converter opens the .mbz file in your browser, removes or rewrites what the older version does not understand, and gives you a converted backup with a report of every change. Nothing is uploaded: the file never leaves your computer.",
      "Moodle no puede restaurar una copia hecha en una versión más nueva. Backup Converter abre el archivo .mbz en tu navegador, quita o reescribe lo que la versión antigua no entiende y te devuelve una copia convertida con un informe de cada cambio. No se sube nada: el archivo no sale de tu ordenador.",
    ),
    does: [
      t("Targets Moodle 4.5, 4.1, and 3.11, plus experimental profiles for 5.1, 5.0, 4.4, 4.3, 4.2, and 4.0.", "Convierte para Moodle 4.5, 4.1 y 3.11, y tiene perfiles experimentales para 5.1, 5.0, 4.4, 4.3, 4.2 y 4.0."),
      t("Detects activities the destination does not support and asks before removing them.", "Detecta las actividades que el destino no admite y pregunta antes de quitarlas."),
      t("Refuses to “convert” to a newer version: that is a normal restore.", "No «convierte» a una versión más nueva: eso es una restauración normal."),
      t("Downloads the converted .mbz and a JSON report of the changes.", "Descarga el .mbz convertido y un informe JSON con los cambios."),
    ],
    needs: [
      t("A recent desktop browser with enough memory for the backup.", "Un navegador de escritorio reciente con memoria suficiente para la copia."),
      t("A Moodle backup (.mbz) of up to 768 MB.", "Una copia de seguridad de Moodle (.mbz) de hasta 768 MB."),
      t("Permission to restore courses on the destination site.", "Permiso para restaurar cursos en el sitio de destino."),
    ],
    get: { label: t("Open Backup Converter", "Abrir Backup Converter"), href: "/tools/backup-converter/" },
    install: [
      {
        title: t("Nothing to install", "No hay nada que instalar"),
        steps: [
          { text: t("Open Backup Converter on moodlia.com. It runs entirely in your browser, with no account.", "Abre Backup Converter en moodlia.com. Funciona por completo en tu navegador y sin cuenta.") },
        ],
      },
    ],
    firstUse: [
      { text: t("Make a backup of the course on the newer Moodle site and download the .mbz file.", "Haz una copia de seguridad del curso en el Moodle más nuevo y descarga el archivo .mbz.") },
      { text: t("In Backup Converter, select the file and choose the destination version.", "En Backup Converter, selecciona el archivo y elige la versión de destino.") },
      { text: t("Read the report. Approve the removal of unsupported activities only if you agree.", "Lee el informe. Aprueba quitar las actividades no compatibles solo si estás de acuerdo.") },
      { text: t("Download the converted backup and restore it into an empty test course first.", "Descarga la copia convertida y restáurala primero en un curso de prueba vacío.") },
    ],
    limits: [
      t("A successful restore cannot be guaranteed: Moodle and third-party plugins validate their own data.", "No se puede garantizar que la restauración funcione: Moodle y los plugins de terceros validan sus propios datos."),
      t("Moodle 4.x question banks cannot be reliably converted to 3.11; the converter blocks this by default.", "Los bancos de preguntas de Moodle 4.x no se pueden convertir con fiabilidad a 3.11; el conversor lo bloquea por defecto."),
      t("Test experimental profiles before using them with a real course.", "Prueba los perfiles experimentales antes de usarlos con un curso real."),
    ],
    docs: [{ label: t("Supported targets and limitations", "Destinos admitidos y limitaciones"), href: "https://github.com/gafapa/moodlia-backup-converter#readme" }],
    source: "https://github.com/gafapa/moodlia-backup-converter",
    license: "GPL-3.0-or-later",
  },
  {
    slug: "edx-converter",
    name: "MoodlIA edX Converter",
    place: "computer",
    level: "local",
    status: "stable",
    summary: t(
      "Turn an Open edX course export into a Moodle course backup.",
      "Convierte la exportación de un curso de Open edX en una copia de seguridad de Moodle.",
    ),
    description: t(
      "Reads an Open edX course export (OLX) and builds a Moodle backup with one section per chapter: HTML becomes Pages, problems become quiz questions, and videos and links become URLs or Pages. Every block gets a diagnostic, so you know what still needs manual work. It runs in the browser and does not talk to Moodle.",
      "Lee la exportación de un curso de Open edX (OLX) y genera una copia de Moodle con una sección por capítulo: el HTML se convierte en Páginas, los problemas en preguntas de cuestionario y los vídeos y enlaces en URL o Páginas. Cada bloque recibe un diagnóstico, para que sepas qué falta por hacer a mano. Funciona en el navegador y no se conecta a Moodle.",
    ),
    does: [
      t("Accepts .tar.gz, .tgz, and .zip exports.", "Acepta exportaciones .tar.gz, .tgz y .zip."),
      t("Converts multiple choice, short answer, and numerical problems into quiz questions.", "Convierte los problemas de opción múltiple, respuesta corta y numéricos en preguntas de cuestionario."),
      t("Groups questions into quizzes per subsection, chapter, or unit.", "Agrupa las preguntas en cuestionarios por subsección, capítulo o unidad."),
      t("Marks every source block as converted, partial, or skipped.", "Marca cada bloque de origen como convertido, parcial u omitido."),
    ],
    needs: [
      t("The course export from Open edX Studio (Tools → Export).", "La exportación del curso desde Open edX Studio (Herramientas → Exportar)."),
      t("A computer with Node.js 22 or newer and Git.", "Un ordenador con Node.js 22 o posterior y Git."),
      t("Someone comfortable running two commands in a terminal.", "Alguien que sepa ejecutar dos comandos en una terminal."),
    ],
    get: { label: t("Get the source code", "Obtener el código"), href: "https://github.com/gafapa/moodlia-edx" },
    install: [
      {
        title: t("Run it on your computer", "Ejecútalo en tu ordenador"),
        steps: [
          { text: t("Download the project and install its dependencies:", "Descarga el proyecto e instala sus dependencias:"), code: "git clone https://github.com/gafapa/moodlia-edx.git\ncd moodlia-edx\nnpm install" },
          { text: t("Start it and open the address it prints, normally `http://localhost:5173`:", "Arráncalo y abre la dirección que muestra, normalmente `http://localhost:5173`:"), code: "npm run dev" },
          { text: t("To publish it for a team instead, run `npm run build` and copy the `dist/` folder to any static web server.", "Si prefieres publicarlo para un equipo, ejecuta `npm run build` y copia la carpeta `dist/` a cualquier servidor web estático.") },
        ],
      },
    ],
    firstUse: [
      { text: t("Select the edX export and choose how to group the questions into quizzes.", "Selecciona la exportación de edX y elige cómo agrupar las preguntas en cuestionarios.") },
      { text: t("Review the diagnostics for partial and skipped blocks.", "Revisa los diagnósticos de los bloques parciales y omitidos.") },
      { text: t("Download the .mbz and restore it into a test course with Moodle's normal course restore.", "Descarga el .mbz y restáuralo en un curso de prueba con la restauración normal de Moodle.") },
    ],
    limits: [
      t("Discussions, LTI, custom XBlocks, and other problem types are skipped with a warning.", "Los foros, LTI, XBlocks personalizados y otros tipos de problema se omiten con un aviso."),
      t("Videos keep their original address; files hosted outside the export are not downloaded.", "Los vídeos conservan su dirección original; no se descargan archivos alojados fuera de la exportación."),
      t("The interface is in Spanish only.", "La interfaz solo está en español."),
    ],
    docs: [{ label: t("Conversion table and limitations", "Tabla de conversión y limitaciones"), href: "https://github.com/gafapa/moodlia-edx#readme" }],
    source: "https://github.com/gafapa/moodlia-edx",
    license: "GPL-3.0-or-later",
  },
  {
    slug: "teacher-dashboard",
    name: "MoodlIA Teacher Dashboard",
    place: "computer",
    level: "local",
    status: "stable",
    summary: t(
      "See your courses, upcoming deadlines, and resources on one screen.",
      "Ve tus cursos, las próximas entregas y los recursos en una sola pantalla.",
    ),
    description: t(
      "A dashboard that brings together the courses you teach, their upcoming deadlines, course resources, and direct links back into Moodle. It runs in your browser, has no server, and only reads from Moodle.",
      "Un panel que reúne los cursos que impartes, sus próximas entregas, los recursos de cada curso y enlaces directos a Moodle. Funciona en tu navegador, no tiene servidor y solo lee de Moodle.",
    ),
    does: [
      t("Lists your courses and their upcoming activity deadlines.", "Muestra tus cursos y las próximas fechas de entrega de sus actividades."),
      t("Shows each course's resources with direct links to Moodle.", "Muestra los recursos de cada curso con enlaces directos a Moodle."),
      t("Keeps the Moodle token only for the browser session.", "Guarda el token de Moodle solo durante la sesión del navegador."),
    ],
    needs: [
      t("A Moodle web service token. Your Moodle administrator usually provides it; the functions it needs are listed in the documentation.", "Un token de servicios web de Moodle. Normalmente te lo da el administrador de Moodle; las funciones que necesita están en la documentación."),
      t("A Moodle site that allows requests from the browser (CORS). Some sites block them.", "Un Moodle que acepte peticiones desde el navegador (CORS). Algunos sitios las bloquean."),
      t("Git, or the project downloaded as a ZIP from GitHub.", "Git, o el proyecto descargado como ZIP desde GitHub."),
    ],
    get: { label: t("Get the source code", "Obtener el código"), href: "https://github.com/gafapa/moodlia-teacher-dashboard" },
    install: [
      {
        title: t("Run it on your computer", "Ejecútalo en tu ordenador"),
        steps: [
          { text: t("Download the project:", "Descarga el proyecto:"), code: "git clone https://github.com/gafapa/moodlia-teacher-dashboard.git\ncd moodlia-teacher-dashboard" },
          { text: t("Open `index.html` in the browser, or serve the folder and visit `http://localhost:4173`:", "Abre `index.html` en el navegador, o sirve la carpeta y visita `http://localhost:4173`:"), code: "python -m http.server 4173" },
        ],
      },
    ],
    firstUse: [
      { text: t("Enter your Moodle address (it must start with https://) and your token.", "Escribe la dirección de tu Moodle (debe empezar por https://) y tu token.") },
      { text: t("The dashboard loads your courses. Close the browser to forget the token.", "El panel carga tus cursos. Cierra el navegador para olvidar el token.") },
    ],
    limits: [
      t("If Moodle blocks browser requests (CORS), the dashboard cannot connect: the site administrator must allow them.", "Si Moodle bloquea las peticiones del navegador (CORS), el panel no puede conectarse: el administrador del sitio tiene que permitirlas."),
    ],
    docs: [{ label: t("Required Moodle functions", "Funciones de Moodle necesarias"), href: "https://github.com/gafapa/moodlia-teacher-dashboard#moodle-requirements" }],
    source: "https://github.com/gafapa/moodlia-teacher-dashboard",
    license: "GPL-3.0-or-later",
  },
  {
    slug: "analyzer-web",
    name: "MoodlIA Analyzer Web",
    place: "computer",
    level: "local",
    status: "stable",
    summary: t(
      "Find which students need help, with course and student analytics from Moodle data.",
      "Descubre qué estudiantes necesitan ayuda, con analítica del curso y de cada estudiante a partir de los datos de Moodle.",
    ),
    description: t(
      "Analyzes a Moodle course in the browser: participation, submissions, grades, and quiz results. It classifies each student's risk against a passing threshold you set, suggests interventions, and explains how to read every chart. It can optionally write reports with an AI service approved by your institution.",
      "Analiza un curso de Moodle en el navegador: participación, entregas, calificaciones y resultados de cuestionarios. Clasifica el riesgo de cada estudiante según el aprobado que fijes, propone intervenciones y explica cómo leer cada gráfico. Opcionalmente, redacta informes con un servicio de IA aprobado por tu centro.",
    ),
    does: [
      t("Risk classification, alerts, and a prioritized intervention list.", "Clasificación de riesgo, alertas y una lista de intervenciones por prioridad."),
      t("Course views: activity trends, submission punctuality, quiz results, completion bottlenecks.", "Vistas del curso: tendencias de actividad, puntualidad de las entregas, resultados de cuestionarios y cuellos de botella de finalización."),
      t("Student views: progress, quiz history, weekly activity, predictions.", "Vistas de cada estudiante: progreso, historial de cuestionarios, actividad semanal y predicciones."),
      t("CSV and JSON export of the student list.", "Exportación de la lista de estudiantes en CSV y JSON."),
    ],
    needs: [
      t("A Moodle web service token, or a Moodle username and password if your site allows creating tokens from the browser.", "Un token de servicios web de Moodle, o tu usuario y contraseña si tu sitio permite crear tokens desde el navegador."),
      t("A Moodle site that allows requests from the browser (CORS).", "Un Moodle que acepte peticiones desde el navegador (CORS)."),
      t("A computer with Node.js 22 or newer, npm 10 or newer, and Git.", "Un ordenador con Node.js 22 o posterior, npm 10 o posterior y Git."),
    ],
    get: { label: t("Get the source code", "Obtener el código"), href: "https://github.com/gafapa/moodlia-analyzer-web" },
    install: [
      {
        title: t("Run it on your computer", "Ejecútalo en tu ordenador"),
        steps: [
          { text: t("Download the project and install its dependencies:", "Descarga el proyecto e instala sus dependencias:"), code: "git clone https://github.com/gafapa/moodlia-analyzer-web.git\ncd moodlia-analyzer-web\nnpm install" },
          { text: t("Start it and open `http://localhost:5173`:", "Arráncalo y abre `http://localhost:5173`:"), code: "npm run dev" },
        ],
      },
    ],
    firstUse: [
      { text: t("Connect with your Moodle address and token.", "Conéctate con la dirección de tu Moodle y tu token.") },
      { text: t("Choose a course, set the passing threshold, and run the analysis.", "Elige un curso, fija el aprobado y lanza el análisis.") },
      { text: t("Start with the intervention list, then open a student's view for details.", "Empieza por la lista de intervenciones y abre la vista de un estudiante para ver el detalle.") },
    ],
    limits: [
      t("If Moodle blocks browser requests (CORS), the app cannot connect without a change on the Moodle server.", "Si Moodle bloquea las peticiones del navegador (CORS), la aplicación no puede conectarse sin un cambio en el servidor de Moodle."),
      t("AI reports leave out names and email addresses but include internal identifiers and grades. Use only a service your institution approves.", "Los informes con IA omiten nombres y correos, pero incluyen identificadores internos y calificaciones. Usa solo un servicio aprobado por tu centro."),
      t("Analysis results are cached in the browser for four hours.", "Los resultados del análisis se guardan en el navegador durante cuatro horas."),
    ],
    docs: [{ label: t("Analytics and Moodle requirements", "Analítica y requisitos de Moodle"), href: "https://github.com/gafapa/moodlia-analyzer-web#readme" }],
    source: "https://github.com/gafapa/moodlia-analyzer-web",
    license: "MIT",
  },
  {
    slug: "moodle-plugin",
    name: "MoodlIA Moodle Plugin",
    place: "moodle",
    level: "technical",
    status: "stable",
    version: "0.1.215",
    summary: t(
      "Let AI assistants and scripts work with Moodle safely, within Moodle's own permissions.",
      "Permite que asistentes de IA y scripts trabajen con Moodle de forma segura, dentro de los permisos del propio Moodle.",
    ),
    description: t(
      "A Moodle local plugin (`local_moodlia`) that adds about 250 operations for courses, activities, question banks, enrolments, groups, files, audits, and backups. They are available through REST and through an MCP endpoint, so an AI assistant such as ChatGPT or Claude can use them directly. Every request runs as a Moodle user and is limited by that user's permissions.",
      "Un plugin local de Moodle (`local_moodlia`) que añade unas 250 operaciones sobre cursos, actividades, bancos de preguntas, matriculaciones, grupos, archivos, auditorías y copias de seguridad. Están disponibles por REST y por un endpoint MCP, para que un asistente de IA como ChatGPT o Claude pueda usarlas directamente. Cada petición se ejecuta como un usuario de Moodle y está limitada por sus permisos.",
    ),
    does: [
      t("Create and update courses, sections, activities, quizzes, and question banks.", "Crea y modifica cursos, secciones, actividades, cuestionarios y bancos de preguntas."),
      t("Audit a course before publishing it: completion rules, gradebook, structure.", "Audita un curso antes de publicarlo: reglas de finalización, calificador y estructura."),
      t("Manage enrolments, groups, files, backups, and restores.", "Gestiona matriculaciones, grupos, archivos, copias de seguridad y restauraciones."),
      t("Serve an MCP endpoint at `/local/moodlia/mcp.php` for AI assistants.", "Ofrece un endpoint MCP en `/local/moodlia/mcp.php` para asistentes de IA."),
    ],
    needs: [
      t("Moodle 4.5, 5.0, 5.1, 5.2, or 5.3 (5.3 is validated against its beta).", "Moodle 4.5, 5.0, 5.1, 5.2 o 5.3 (la 5.3 está validada con su beta)."),
      t("A site administrator to install it and create the access token.", "Un administrador del sitio que lo instale y cree el token de acceso."),
      t("A current backup of the Moodle code, database, and moodledata.", "Una copia de seguridad reciente del código, la base de datos y moodledata de Moodle."),
    ],
    get: { label: t("Download from the Moodle Marketplace", "Descargar del Moodle Marketplace"), href: "https://marketplace.moodle.com/plugins/local_moodlia" },
    install: [
      {
        title: t("1. Install the plugin", "1. Instala el plugin"),
        steps: [
          { text: t("Download `local_moodlia-<version>.zip` from the Moodle Marketplace or from the GitHub releases. Do not use GitHub's “Source code” ZIP.", "Descarga `local_moodlia-<versión>.zip` del Moodle Marketplace o de las releases de GitHub. No uses el ZIP «Source code» de GitHub.") },
          { text: t("Go to Site administration → Plugins → Install plugins, upload the ZIP, and select “Install plugin from the ZIP file”.", "Ve a Administración del sitio → Extensiones → Instalar complementos, sube el ZIP y pulsa «Instalar complemento desde archivo ZIP».") },
          { text: t("Continue through the checks and select “Upgrade Moodle database now”.", "Continúa con las comprobaciones y pulsa «Actualizar base de datos Moodle ahora».") },
          { text: t("Check that Site administration → Plugins → Plugins overview lists MoodlIA (`local_moodlia`) under Local plugins.", "Comprueba que Administración del sitio → Extensiones → Vista general de extensiones muestra MoodlIA (`local_moodlia`) en Extensiones locales.") },
        ],
      },
      {
        title: t("2. Give one account access", "2. Da acceso a una cuenta"),
        steps: [
          { text: t("Enable Web services (Site administration → General → Advanced features) and the REST protocol (Server → Web services → Manage protocols).", "Activa «Habilitar servicios web» (Administración del sitio → General → Opciones avanzadas) y el protocolo REST (Servidor → Servicios Web → Administrar protocolos).") },
          { text: t("Create a dedicated user, for example `moodlia-service`. Do not use an administrator or a teacher's personal account.", "Crea un usuario dedicado, por ejemplo `moodlia-service`. No uses un administrador ni la cuenta personal de un docente.") },
          { text: t("Define a system role “MoodlIA service user” (no archetype) that allows `webservice/rest:use` and `local/moodlia:useapi`, and assign it to that user.", "Define un rol de sistema «MoodlIA service user» (sin arquetipo) que permita `webservice/rest:use` y `local/moodlia:useapi`, y asígnaselo a ese usuario.") },
          { text: t("Give the account only the course permissions it needs, for example by enrolling it as a teacher in the courses it will manage.", "Da a la cuenta solo los permisos que necesite en los cursos, por ejemplo matriculándola como docente en los cursos que vaya a gestionar.") },
          { text: t("In Server → Web services → External services → MoodlIA service → Authorised users, add the account.", "En Servidor → Servicios Web → Servicios externos → MoodlIA service → usuarios autorizados, añade la cuenta.") },
          { text: t("In Manage tokens, create a token for that user and the MoodlIA service, with an expiry date. Store it as a secret.", "En Administrar fichas (tokens), crea un token para ese usuario y el servicio MoodlIA, con fecha de caducidad. Guárdalo como un secreto.") },
        ],
      },
      {
        title: t("3. Connect a client", "3. Conecta un cliente"),
        steps: [
          { text: t("From a terminal, install MoodlIA CLI and run a read-only check (see MoodlIA CLI).", "Desde una terminal, instala MoodlIA CLI y haz una comprobación de solo lectura (ver MoodlIA CLI).") },
          { text: t("From an AI assistant that supports MCP, use this endpoint with the token as a Bearer credential:", "Desde un asistente de IA compatible con MCP, usa este endpoint con el token como credencial Bearer:"), code: "https://your-moodle.example/local/moodlia/mcp.php\nAuthorization: Bearer <token>" },
        ],
      },
    ],
    firstUse: [
      { text: t("Confirm the token belongs to the service account, not to the administrator who created it:", "Confirma que el token es de la cuenta de servicio y no del administrador que lo creó:"), code: "moodlia get-current-user --format json" },
      { text: t("Try the first changes in a copied or test course.", "Prueba los primeros cambios en un curso copiado o de prueba.") },
    ],
    limits: [
      t("The plugin never bypasses Moodle permissions: an operation fails if the account lacks the capability.", "El plugin nunca se salta los permisos de Moodle: una operación falla si la cuenta no tiene la capacidad."),
      t("On Moodle 4.5, standalone question bank activities are not available; they need Moodle 5.0 or later.", "En Moodle 4.5 no existen las actividades de banco de preguntas independientes; necesitan Moodle 5.0 o posterior."),
      t("The release is marked beta in the Moodle Marketplace.", "La versión está marcada como beta en el Moodle Marketplace."),
    ],
    docs: [
      { label: t("Step-by-step installation with screenshots", "Instalación paso a paso con capturas"), href: "https://github.com/gafapa/moodle-local_moodlia/blob/main/docs/web-installation.md" },
      { label: t("Connect ChatGPT, Claude, or Codex through MCP", "Conectar ChatGPT, Claude o Codex por MCP"), href: "https://github.com/gafapa/moodle-local_moodlia/blob/main/docs/mcp-client-setup.md" },
      { label: t("Releases and ZIP downloads", "Versiones y descargas ZIP"), href: "https://github.com/gafapa/moodle-local_moodlia/releases" },
    ],
    source: "https://github.com/gafapa/moodle-local_moodlia",
    license: "GPL-3.0-or-later",
  },
  {
    slug: "cli",
    name: "MoodlIA CLI",
    place: "terminal",
    level: "technical",
    status: "stable",
    version: "0.4.1",
    summary: t(
      "Run every MoodlIA plugin operation from a terminal, a script, or an AI agent's shell.",
      "Ejecuta cualquier operación del plugin MoodlIA desde una terminal, un script o la shell de un agente de IA.",
    ),
    description: t(
      "The npm package moodlia provides the moodlia command and a Node.js client. Each plugin operation is a command with JSON output. Adaptive commands, such as course audits, use the plugin when it is available and Moodle's standard web services when it is not.",
      "El paquete npm moodlia ofrece el comando moodlia y un cliente para Node.js. Cada operación del plugin es un comando con salida JSON. Los comandos adaptativos, como las auditorías de curso, usan el plugin cuando está disponible y los servicios web estándar de Moodle cuando no.",
    ),
    does: [
      t("One command per plugin operation, with built-in help and parameter checks.", "Un comando por cada operación del plugin, con ayuda integrada y validación de parámetros."),
      t("Course audit, progress, completion repair, and enrolment workflows.", "Flujos de auditoría de curso, progreso, reparación de la finalización y matriculaciones."),
      t("Site profiles that keep tokens in environment variables.", "Perfiles de sitio que guardan los tokens en variables de entorno."),
    ],
    needs: [
      t("Node.js 22.13 or newer.", "Node.js 22.13 o posterior."),
      t("A Moodle site with the MoodlIA plugin and a token for it.", "Un Moodle con el plugin MoodlIA y un token para él."),
    ],
    get: { label: t("View on npm", "Ver en npm"), href: "https://www.npmjs.com/package/moodlia" },
    install: [
      {
        title: t("Install and configure", "Instala y configura"),
        steps: [
          { text: t("Install the command globally:", "Instala el comando de forma global:"), code: "npm install -g moodlia" },
          { text: t("Set the Moodle address and token (bash):", "Indica la dirección de Moodle y el token (bash):"), code: "export MOODLE_BASE_URL=\"https://your-moodle.example\"\nexport MOODLE_REST_TOKEN=\"your-token\"" },
          { text: t("Or in PowerShell:", "O en PowerShell:"), code: "$env:MOODLE_BASE_URL = \"https://your-moodle.example\"\n$env:MOODLE_REST_TOKEN = \"your-token\"" },
          { text: t("The same two values can also go in a .env file in the working folder.", "Los mismos dos valores pueden ir también en un archivo .env en la carpeta de trabajo.") },
        ],
      },
    ],
    firstUse: [
      { text: t("Start with read-only commands:", "Empieza con comandos de solo lectura:"), code: "moodlia get-current-user --format json\nmoodlia get-moodlia-status --format json\nmoodlia get-courses --limit 10 --format json" },
      { text: t("List every command, or the parameters of one:", "Consulta todos los comandos, o los parámetros de uno:"), code: "moodlia --help\nmoodlia create-module --help" },
    ],
    limits: [
      t("Remote Moodle addresses must use HTTPS.", "Las direcciones de Moodle remotas deben usar HTTPS."),
      t("Synchronization between sites moved to MoodlIA Sync in version 0.4.0.", "La sincronización entre sitios pasó a MoodlIA Sync en la versión 0.4.0."),
    ],
    docs: [{ label: t("Commands, profiles, and options", "Comandos, perfiles y opciones"), href: "https://github.com/gafapa/moodlia-cli#readme" }],
    source: "https://github.com/gafapa/moodlia-cli",
    license: "GPL-3.0-or-later",
  },
  {
    slug: "moodle-core-cli",
    name: "Moodle Core CLI",
    place: "terminal",
    level: "technical",
    status: "stable",
    version: "0.4.1",
    summary: t(
      "Automate Moodle through its standard web services, with nothing to install on Moodle.",
      "Automatiza Moodle con sus servicios web estándar, sin instalar nada en Moodle.",
    ),
    description: t(
      "The npm package moodle-core-cli is a Node.js library and command for Moodle's own web services. It offers friendly operations such as `create_course` and handles Moodle function names, parameters, and version differences for you. Use it when your site cannot install the MoodlIA plugin.",
      "El paquete npm moodle-core-cli es una biblioteca y un comando para Node.js que usan los servicios web del propio Moodle. Ofrece operaciones sencillas como `create_course` y se encarga de los nombres de función, los parámetros y las diferencias entre versiones. Úsalo cuando tu sitio no pueda instalar el plugin MoodlIA.",
    ),
    does: [
      t("Friendly operations for courses, users, enrolments, groups, grades, and more, on Moodle 4.5 to 5.3.", "Operaciones sencillas para cursos, usuarios, matriculaciones, grupos, calificaciones y más, en Moodle 4.5 a 5.3."),
      t("Read-only by default: writes need `--allow-write` and deletions also --yes.", "De solo lectura por defecto: escribir exige `--allow-write` y borrar, además, --yes."),
      t("JSON output and stable exit codes for automation.", "Salida JSON y códigos de salida estables para automatizar."),
    ],
    needs: [
      t("Node.js 22.13 or newer.", "Node.js 22.13 o posterior."),
      t("Web services and REST enabled, and an external service with the Moodle functions you will use.", "Servicios web y REST activados, y un servicio externo con las funciones de Moodle que vayas a usar."),
      t("A token for a dedicated user with only the permissions it needs.", "Un token de un usuario dedicado con solo los permisos que necesite."),
    ],
    get: { label: t("View on npm", "Ver en npm"), href: "https://www.npmjs.com/package/moodle-core-cli" },
    install: [
      {
        title: t("Prepare Moodle (administrator)", "Prepara Moodle (administrador)"),
        steps: [
          { text: t("Enable web services and the REST protocol.", "Activa los servicios web y el protocolo REST.") },
          { text: t("Create an external service and add the core functions you need, plus `core_webservice_get_site_info` for version detection.", "Crea un servicio externo y añade las funciones que necesites, además de `core_webservice_get_site_info` para detectar la versión.") },
          { text: t("Create a dedicated user with the required permissions and a token for that service.", "Crea un usuario dedicado con los permisos necesarios y un token para ese servicio.") },
        ],
      },
      {
        title: t("Install and configure", "Instala y configura"),
        steps: [
          { text: t("Install the package, or run it directly with npx:", "Instala el paquete, o ejecútalo directamente con npx:"), code: "npm install moodle-core-cli" },
          { text: t("Set the Moodle address and token:", "Indica la dirección de Moodle y el token:"), code: "export MOODLE_BASE_URL=https://moodle.example.com\nexport MOODLE_TOKEN=your-token" },
        ],
      },
    ],
    firstUse: [
      { text: t("Read before you write:", "Lee antes de escribir:"), code: "npx moodle-core-cli get-courses\nnpx moodle-core-cli get-course --course-id 42" },
      { text: t("Writing requires an explicit flag:", "Escribir exige un indicador explícito:"), code: "npx moodle-core-cli create-course --allow-write \\\n  --fullname \"Introduction to Biology\" --shortname BIO101 --category-id 3" },
    ],
    limits: [
      t("It can only do what the Moodle service exposes and what the token's user is allowed to do.", "Solo puede hacer lo que exponga el servicio de Moodle y lo que el usuario del token tenga permitido."),
    ],
    docs: [
      { label: t("Moodle setup for administrators", "Configuración de Moodle para administradores"), href: "https://github.com/gafapa/moodle-core-cli/blob/main/docs/moodle-setup.md" },
      { label: t("Supported operations by version", "Operaciones admitidas por versión"), href: "https://github.com/gafapa/moodle-core-cli/blob/main/docs/API-COVERAGE.md" },
    ],
    source: "https://github.com/gafapa/moodle-core-cli",
    license: "MIT",
  },
  {
    slug: "sync",
    name: "MoodlIA Sync",
    place: "terminal",
    level: "technical",
    status: "preview",
    version: "0.1.1",
    summary: t(
      "Copy course content from one Moodle site to another without backups, after you approve a plan.",
      "Copia el contenido de un curso de un Moodle a otro sin copias de seguridad, después de aprobar un plan.",
    ),
    description: t(
      "MoodlIA Sync reads a source course and writes a plan with the exact changes the target course needs. Nothing is written until you approve that plan; then it applies it and verifies the result. It works with Moodle's standard web services and, where installed, the MoodlIA plugin, choosing per feature.",
      "MoodlIA Sync lee un curso de origen y escribe un plan con los cambios exactos que necesita el curso de destino. No se escribe nada hasta que apruebas ese plan; entonces lo aplica y verifica el resultado. Funciona con los servicios web estándar de Moodle y, donde esté instalado, con el plugin MoodlIA, eligiendo en cada caso.",
    ),
    does: [
      t("Plan, approve, apply, and verify, as separate steps.", "Planificar, aprobar, aplicar y verificar, como pasos separados."),
      t("Stops if either course changed after the plan was made.", "Se detiene si alguno de los cursos cambió después de hacer el plan."),
      t("Keeps tokens in environment variables, never in plans or state.", "Guarda los tokens en variables de entorno, nunca en los planes ni en el estado."),
    ],
    needs: [
      t("Node.js 22.13 or newer.", "Node.js 22.13 o posterior."),
      t("Tokens for both Moodle sites (standard web services and/or the MoodlIA plugin).", "Tokens para los dos sitios Moodle (servicios web estándar y/o el plugin MoodlIA)."),
    ],
    get: { label: t("View on npm", "Ver en npm"), href: "https://www.npmjs.com/package/moodlia-sync" },
    install: [
      {
        title: t("Install", "Instala"),
        steps: [
          { text: t("Install the command globally:", "Instala el comando de forma global:"), code: "npm install -g moodlia-sync" },
          { text: t("If your npm policy blocks install scripts, approve and build the database driver once:", "Si tu política de npm bloquea los scripts de instalación, aprueba y compila una vez el controlador de base de datos:"), code: "npm approve-scripts better-sqlite3\nnpm rebuild better-sqlite3" },
          { text: t("Describe both sites in `.moodle-profiles.json`; each token is read from the environment variable you name:", "Describe los dos sitios en `.moodle-profiles.json`; cada token se lee de la variable de entorno que indiques:"), code: "{\n  \"schema_version\": 1,\n  \"profiles\": {\n    \"school_a\": { \"url\": \"https://moodle-a.example.edu\",\n      \"credentials\": { \"core\": { \"token_env\": \"SCHOOL_A_CORE_TOKEN\" } } },\n    \"school_b\": { \"url\": \"https://moodle-b.example.edu\",\n      \"credentials\": { \"core\": { \"token_env\": \"SCHOOL_B_CORE_TOKEN\" } } }\n  }\n}" },
        ],
      },
    ],
    firstUse: [
      { text: t("Plan (read-only) and review plan.json:", "Planifica (solo lectura) y revisa plan.json:"), code: "moodlia-sync plan --source-profile school_a --source-course-id 42 \\\n  --target-profile school_b --target-course-id 108 --plan-file plan.json" },
      { text: t("Approve that exact plan, apply it, and verify:", "Aprueba exactamente ese plan, aplícalo y verifica:"), code: "moodlia-sync approve plan.json --yes\nmoodlia-sync apply plan.json --plan-digest <sha256:...> --allow-write\nmoodlia-sync verify --plan-id <plan_id>" },
    ],
    limits: [
      t("Preview: only the content types verified for each site pairing are synchronized; the rest is reported in the plan.", "En preview: solo se sincronizan los tipos de contenido verificados para cada pareja de sitios; el resto se indica en el plan."),
      t("Try it with test courses before using it with real ones.", "Pruébalo con cursos de prueba antes de usarlo con cursos reales."),
    ],
    docs: [
      { label: t("What each site pairing can synchronize", "Qué puede sincronizar cada pareja de sitios"), href: "https://github.com/gafapa/moodlia-sync/blob/main/docs/SYNC-CAPABILITY-MATRIX.md" },
      { label: t("Commands and safety model", "Comandos y modelo de seguridad"), href: "https://github.com/gafapa/moodlia-sync#readme" },
    ],
    source: "https://github.com/gafapa/moodlia-sync",
    license: "GPL-3.0-or-later",
  },
  {
    slug: "skills",
    name: "MoodlIA Skills",
    place: "agent",
    level: "technical",
    status: "stable",
    summary: t(
      "Teach an AI agent to operate Moodle through MoodlIA and to write content that survives backup and restore.",
      "Enseña a un agente de IA a manejar Moodle con MoodlIA y a crear contenido que sobreviva a copias y restauraciones.",
    ),
    description: t(
      "Two agent skills. `operate-moodle-with-moodlia` guides an agent to inspect, create, publish, back up, and verify Moodle content through the MoodlIA MCP server or CLI, using only real operations. `design-portable-moodle-content` guides it to create accessible HTML and self-contained interactive content that keeps working after a Moodle backup and restore.",
      "Dos skills para agentes. `operate-moodle-with-moodlia` guía a un agente para consultar, crear, publicar, copiar y verificar contenido de Moodle con el servidor MCP o la CLI de MoodlIA, usando solo operaciones reales. `design-portable-moodle-content` le guía para crear HTML accesible y contenido interactivo autónomo que siga funcionando tras una copia y restauración de Moodle.",
    ),
    does: [
      t("Choose MCP or CLI and never invent operations or parameters.", "Elegir entre MCP y CLI sin inventar operaciones ni parámetros."),
      t("Verify every change by reading Moodle back.", "Verificar cada cambio volviendo a leer Moodle."),
      t("Produce portable, accessible content packages.", "Producir paquetes de contenido portables y accesibles."),
    ],
    needs: [
      t("An AI agent that supports skills, such as Claude Code or Codex.", "Un agente de IA compatible con skills, como Claude Code o Codex."),
      t("For operating Moodle: the MoodlIA plugin, reached through MCP or MoodlIA CLI.", "Para manejar Moodle: el plugin MoodlIA, a través de MCP o de MoodlIA CLI."),
    ],
    get: { label: t("Get the skills", "Obtener las skills"), href: "https://github.com/gafapa/moodlia-skills" },
    install: [
      {
        title: t("Install the skills", "Instala las skills"),
        steps: [
          { text: t("Download the repository:", "Descarga el repositorio:"), code: "git clone https://github.com/gafapa/moodlia-skills.git" },
          { text: t("Copy each complete skill folder, with its references, into your agent's skills folder, for example `~/.claude/skills/` for Claude Code or `~/.codex/skills/` for Codex:", "Copia cada carpeta de skill completa, con sus referencias, en la carpeta de skills de tu agente, por ejemplo `~/.claude/skills/` en Claude Code o `~/.codex/skills/` en Codex:"), code: "cp -r moodlia-skills/operate-moodle-with-moodlia ~/.claude/skills/\ncp -r moodlia-skills/design-portable-moodle-content ~/.claude/skills/" },
        ],
      },
    ],
    firstUse: [
      { text: t("Connect the agent to Moodle through the MoodlIA MCP endpoint or MoodlIA CLI.", "Conecta el agente a Moodle con el endpoint MCP de MoodlIA o con MoodlIA CLI.") },
      { text: t("Ask for a small task in a test course, for example “create a Page with this text in course 42 and verify it”.", "Pide una tarea pequeña en un curso de prueba, por ejemplo «crea una Página con este texto en el curso 42 y verifícala».") },
    ],
    limits: [
      t("The skills guide the agent; the plugin's permissions and the token still decide what it can do.", "Las skills guían al agente; los permisos del plugin y del token siguen decidiendo qué puede hacer."),
    ],
    docs: [{ label: t("Skill descriptions", "Descripción de las skills"), href: "https://github.com/gafapa/moodlia-skills#readme" }],
    source: "https://github.com/gafapa/moodlia-skills",
    license: "GPL-3.0-or-later",
  },
];

export function getApp(slug: string) {
  return apps.find((app) => app.slug === slug);
}

/** Tasks a visitor may arrive with, each answered by one app. */
export const tasks: Array<{ text: Text; app: AppSlug }> = [
  { text: t("Import a rubric from a spreadsheet", "Importar una rúbrica desde una hoja de cálculo"), app: "rubrics" },
  { text: t("Restore a course on an older Moodle", "Restaurar un curso en un Moodle más antiguo"), app: "backup-converter" },
  { text: t("Bring an Open edX course into Moodle", "Llevar un curso de Open edX a Moodle"), app: "edx-converter" },
  { text: t("See deadlines across all my courses", "Ver las entregas de todos mis cursos"), app: "teacher-dashboard" },
  { text: t("Find students who need help", "Encontrar a los estudiantes que necesitan ayuda"), app: "analyzer-web" },
  { text: t("Let an AI assistant work in Moodle", "Que un asistente de IA trabaje en Moodle"), app: "moodle-plugin" },
  { text: t("Automate Moodle from scripts", "Automatizar Moodle desde scripts"), app: "cli" },
  { text: t("Automate Moodle without installing a plugin", "Automatizar Moodle sin instalar un plugin"), app: "moodle-core-cli" },
  { text: t("Copy a course between two Moodle sites", "Copiar un curso entre dos Moodle"), app: "sync" },
  { text: t("Teach an AI agent to use Moodle well", "Enseñar a un agente de IA a usar bien Moodle"), app: "skills" },
];

export const levels: Record<Level, { title: Text; body: Text }> = {
  browser: {
    title: t("Anyone with a browser", "Cualquiera con un navegador"),
    body: t("Install from a store or open a page. No technical knowledge needed.", "Se instala desde una tienda o se abre una página. No hace falta saber nada técnico."),
  },
  local: {
    title: t("With a little technical help", "Con un poco de ayuda técnica"),
    body: t("Runs on your computer from its source code, and usually needs a Moodle token from your administrator.", "Se ejecuta en tu ordenador desde su código y suele necesitar un token de Moodle que te da el administrador."),
  },
  technical: {
    title: t("For Moodle administrators and developers", "Para administradores de Moodle y desarrolladores"),
    body: t("Installed on the Moodle server or used from a terminal, with web services, roles, and tokens.", "Se instala en el servidor de Moodle o se usa desde una terminal, con servicios web, roles y tokens."),
  },
};

export const places: Record<Place, { title: Text; body: Text }> = {
  browser: {
    title: t("In your browser", "En tu navegador"),
    body: t("A browser extension or a page you open. Nothing reaches a MoodlIA server.", "Una extensión del navegador o una página que abres. Nada llega a un servidor de MoodlIA."),
  },
  computer: {
    title: t("On your computer", "En tu ordenador"),
    body: t("Browser apps you download and start locally. They talk to Moodle directly, without a backend.", "Aplicaciones de navegador que descargas y arrancas en local. Hablan directamente con Moodle, sin servidor intermedio."),
  },
  moodle: {
    title: t("On your Moodle site", "En tu sitio Moodle"),
    body: t("A plugin installed once by a site administrator.", "Un plugin que instala una vez el administrador del sitio."),
  },
  terminal: {
    title: t("In a terminal", "En una terminal"),
    body: t("Command-line tools published on npm, for scripts, automation, and AI agents.", "Herramientas de línea de comandos publicadas en npm, para scripts, automatización y agentes de IA."),
  },
  agent: {
    title: t("In your AI agent", "En tu agente de IA"),
    body: t("Instructions that teach an AI agent how to work with Moodle.", "Instrucciones que enseñan a un agente de IA a trabajar con Moodle."),
  },
};

export const placeOrder: Place[] = ["browser", "computer", "moodle", "terminal", "agent"];
