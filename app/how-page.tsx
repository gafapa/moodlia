import { getApp, type AppSlug, type Locale } from "./content";
import { alternates, appPath, ui } from "./i18n";
import { pageMetadata } from "./seo";
import { HelpBox, PageShell } from "./ui-kit";

type Lane = { title: Record<Locale, string>; body: Record<Locale, string>; apps: AppSlug[] };

const lanes: Lane[] = [
  {
    title: { en: "No connection to Moodle", es: "Sin conexión a Moodle" },
    body: {
      en: "They work inside a Moodle page you already have open, or on files you then restore in Moodle.",
      es: "Funcionan dentro de una página de Moodle que ya tienes abierta, o con archivos que después restauras en Moodle.",
    },
    apps: ["rubrics", "backup-converter", "edx-converter"],
  },
  {
    title: { en: "Moodle's standard web services", es: "Servicios web estándar de Moodle" },
    body: {
      en: "Nothing to install on Moodle. An administrator enables web services and creates a token.",
      es: "No se instala nada en Moodle. Un administrador activa los servicios web y crea un token.",
    },
    apps: ["teacher-dashboard", "analyzer-web", "moodle-core-cli", "sync"],
  },
  {
    title: { en: "The MoodlIA plugin", es: "El plugin MoodlIA" },
    body: {
      en: "Installed once on the site. Adds about 250 operations over REST and MCP, the route for AI assistants.",
      es: "Se instala una vez en el sitio. Añade unas 250 operaciones por REST y MCP, la vía para los asistentes de IA.",
    },
    apps: ["moodle-plugin", "cli", "sync", "skills"],
  },
];

export function ConnectionLanes({ locale }: { locale: Locale }) {
  return (
    <ol className="lanes">
      {lanes.map((lane, index) => (
        <li key={lane.title.en} className={`lane lane-${index + 1}`}>
          <h3>{lane.title[locale]}</h3>
          <p>{lane.body[locale]}</p>
          <ul>
            {lane.apps.map((slug) => {
              const app = getApp(slug)!;
              return <li key={slug}><a href={appPath(slug, locale)}>{app.name}</a></li>;
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}

const content = {
  en: {
    metaTitle: "How MoodlIA works | MoodlIA",
    metaDescription: "How the MoodlIA apps relate: browser tools, Moodle's standard web services, the MoodlIA plugin with REST and MCP, the npm packages, and the safety rules they share.",
    connectTitle: "Two ways to reach Moodle",
    connect: [
      {
        title: "Standard web services",
        body: "Moodle already has a web service API. Moodle Core CLI, Teacher Dashboard, and Analyzer Web use it, so nothing is installed on the site. It is limited to the functions Moodle offers and the administrator adds to the service.",
      },
      {
        title: "The MoodlIA plugin",
        body: "A local plugin adds about 250 higher-level operations, such as creating a complete quiz or auditing a course before publishing it. It also serves an MCP endpoint, which is how AI assistants such as ChatGPT or Claude connect to Moodle.",
      },
    ],
    lanesTitle: "Which app uses which",
    chainTitle: "The command-line packages",
    chainBody: "The three npm packages build on each other. Install only the one you need: each brings the ones below it.",
    chain: [
      ["moodlia-sync", "copies courses between sites; uses both connection routes"],
      ["moodlia", "the MoodlIA CLI; adds the plugin operations"],
      ["moodle-core-cli", "the base: Moodle's standard web services"],
    ],
    safetyTitle: "Rules every app follows",
    safety: [
      ["Moodle decides", "Every request runs as a Moodle user and is limited by that user's permissions. MoodlIA never bypasses them."],
      ["One account, one token", "Use a dedicated Moodle account with the minimum permissions and a token you can revoke, never an administrator's login."],
      ["Look before you change", "Moodle Core CLI is read-only until you add --allow-write, and MoodlIA Sync writes nothing until you approve its plan. Start every tool with read-only commands and a test course."],
      ["Your data stays with you", "Browser tools process files and Moodle data on your computer. No app sends them to a MoodlIA server."],
    ],
    codeTitle: "Open source",
    codeBody: "Every app has its own repository on GitHub, with its documentation, changelog, and issue tracker. Report problems or propose improvements there, or write to us.",
  },
  es: {
    metaTitle: "Cómo funciona MoodlIA | MoodlIA",
    metaDescription: "Cómo se relacionan las apps de MoodlIA: herramientas de navegador, servicios web estándar de Moodle, el plugin MoodlIA con REST y MCP, los paquetes de npm y las reglas de seguridad que comparten.",
    connectTitle: "Dos formas de llegar a Moodle",
    connect: [
      {
        title: "Servicios web estándar",
        body: "Moodle ya tiene una API de servicios web. Moodle Core CLI, Teacher Dashboard y Analyzer Web la usan, así que no se instala nada en el sitio. Está limitada a las funciones que ofrece Moodle y que el administrador añade al servicio.",
      },
      {
        title: "El plugin MoodlIA",
        body: "Un plugin local añade unas 250 operaciones de más alto nivel, como crear un cuestionario completo o auditar un curso antes de publicarlo. También ofrece un endpoint MCP, que es como los asistentes de IA, como ChatGPT o Claude, se conectan a Moodle.",
      },
    ],
    lanesTitle: "Qué usa cada app",
    chainTitle: "Los paquetes de terminal",
    chainBody: "Los tres paquetes de npm se apoyan unos en otros. Instala solo el que necesites: cada uno trae los que tiene debajo.",
    chain: [
      ["moodlia-sync", "copia cursos entre sitios; usa las dos vías de conexión"],
      ["moodlia", "la MoodlIA CLI; añade las operaciones del plugin"],
      ["moodle-core-cli", "la base: los servicios web estándar de Moodle"],
    ],
    safetyTitle: "Reglas que siguen todas las apps",
    safety: [
      ["Moodle decide", "Cada petición se ejecuta como un usuario de Moodle y está limitada por sus permisos. MoodlIA nunca se los salta."],
      ["Una cuenta, un token", "Usa una cuenta de Moodle dedicada con los permisos mínimos y un token que puedas revocar, nunca el acceso de un administrador."],
      ["Mirar antes de cambiar", "Moodle Core CLI solo lee hasta que añades --allow-write, y MoodlIA Sync no escribe nada hasta que apruebas su plan. Empieza siempre con comandos de solo lectura y un curso de prueba."],
      ["Tus datos se quedan contigo", "Las herramientas de navegador procesan los archivos y los datos de Moodle en tu ordenador. Ninguna app los envía a un servidor de MoodlIA."],
    ],
    codeTitle: "Código abierto",
    codeBody: "Cada app tiene su propio repositorio en GitHub, con su documentación, su registro de cambios y su gestor de incidencias. Comunica allí los problemas o propón mejoras, o escríbenos.",
  },
};

export function howMetadata(locale: Locale) {
  return pageMetadata({ locale, title: content[locale].metaTitle, description: content[locale].metaDescription, alternate: alternates("how") });
}

export function HowPage({ locale }: { locale: Locale }) {
  const copy = ui[locale].how;
  const text = content[locale];
  return (
    <PageShell locale={locale} current="how" alternate={alternates("how")}>
      <section className="page-head">
        <div className="container narrow">
          <h1>{copy.title}</h1>
          <p className="lead">{copy.intro}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="connect-title">
        <div className="container">
          <h2 id="connect-title">{text.connectTitle}</h2>
          <div className="two-up">
            {text.connect.map((item) => (
              <article className="panel" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="lanes-title">
        <div className="container">
          <h2 id="lanes-title">{text.lanesTitle}</h2>
          <ConnectionLanes locale={locale} />
        </div>
      </section>

      <section className="section" aria-labelledby="chain-title">
        <div className="container narrow">
          <h2 id="chain-title">{text.chainTitle}</h2>
          <p>{text.chainBody}</p>
          <ol className="chain">
            {text.chain.map(([name, role]) => (
              <li key={name}><code>{name}</code><span>{role}</span></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="safety-title">
        <div className="container">
          <h2 id="safety-title">{text.safetyTitle}</h2>
          <div className="rule-grid">
            {text.safety.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="code-title">
        <div className="container narrow">
          <h2 id="code-title">{text.codeTitle}</h2>
          <p>{text.codeBody}</p>
          <p><a href="https://github.com/gafapa">github.com/gafapa →</a></p>
        </div>
      </section>

      <div className="container"><HelpBox locale={locale} /></div>
    </PageShell>
  );
}
