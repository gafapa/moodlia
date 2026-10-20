import { getApp, type AppSlug, type Locale } from "./content";
import { alternates, appPath } from "./i18n";
import { pageMetadata } from "./seo";
import { ArrowIcon } from "./icons";
import { HelpBox, PageShell } from "./ui-kit";
import { EditorialArt } from "./editorial-art";

type Lane = { title: Record<Locale, string>; body: Record<Locale, string>; apps: AppSlug[] };

const lanes: Lane[] = [
  {
    title: { en: "No connection to Moodle", es: "Sin conexión a Moodle" },
    body: {
      en: "Install your own local Moodle, work in an open Moodle page, convert course files, or prepare portable learning content locally.",
      es: "Instala tu propio Moodle local, trabaja en una página de Moodle abierta, convierte archivos de cursos o prepara contenido educativo portable de forma local.",
    },
    apps: ["portable", "rubrics", "backup-converter", "edx-converter", "skills"],
  },
  {
    title: { en: "Moodle's standard web services", es: "Servicios web estándar de Moodle" },
    body: {
      en: "Nothing to install on Moodle. Enable web services and create a token.",
      es: "No se instala nada en Moodle. Activa los servicios web y crea un token.",
    },
    apps: ["teacher-dashboard", "analyzer-web", "moodle-core-cli", "sync"],
  },
  {
    title: { en: "The MoodlIA plugin", es: "El plugin MoodlIA" },
    body: {
      en: "Installed once on the site. Adds about 250 operations over REST and MCP, the route for AI assistants.",
      es: "Se instala una vez en el sitio. Añade unas 250 operaciones por REST y MCP, la vía para los asistentes de IA.",
    },
    apps: ["moodle-plugin", "cli", "sync"],
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
        body: "Moodle already has a web service API. Moodle Core CLI, Teacher Dashboard, and Analyzer Web use it, so nothing is installed on the site. It is limited to the functions Moodle offers and the service has enabled.",
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
      ["One account, one token", "Use a dedicated Moodle service account with the minimum permissions and a token you can revoke, separate from personal accounts."],
      ["Look before you change", "Moodle Core CLI is read-only until you add --allow-write, and MoodlIA Sync writes nothing until you approve its plan. Start every tool with read-only commands and a test course."],
      ["Know the destination", "Converters process files in your browser. AI-assisted work sends the necessary evidence to your chosen provider. A local provider is an option where the tool supports it; there is no MoodlIA AI server."],
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
        body: "Moodle ya tiene una API de servicios web. Moodle Core CLI, Teacher Dashboard y Analyzer Web la usan, así que no se instala nada en el sitio. Está limitada a las funciones que ofrece Moodle y que están habilitadas en el servicio.",
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
      ["Una cuenta, un token", "Usa una cuenta de servicio de Moodle dedicada con los permisos mínimos y un token que puedas revocar, separada de las cuentas personales."],
      ["Mirar antes de cambiar", "Moodle Core CLI solo lee hasta que añades --allow-write, y MoodlIA Sync no escribe nada hasta que apruebas su plan. Empieza siempre con comandos de solo lectura y un curso de prueba."],
      ["Conoce el destino", "Los conversores procesan los archivos en tu navegador. El trabajo con IA envía las evidencias necesarias al proveedor elegido. Un proveedor local es una opción cuando la herramienta lo admite; no hay un servidor de IA de MoodlIA."],
    ],
    codeTitle: "Código abierto",
    codeBody: "Cada app tiene su propio repositorio en GitHub, con su documentación, su registro de cambios y su gestor de incidencias. Comunica allí los problemas o propón mejoras, o escríbenos.",
  },
};

export function howMetadata(locale: Locale) {
  return pageMetadata({ locale, title: content[locale].metaTitle, description: content[locale].metaDescription, alternate: alternates("how") });
}

export function HowPage({ locale }: { locale: Locale }) {
  const text = content[locale];
  return (
    <PageShell locale={locale} current="how" alternate={alternates("how")}>
      <section className="page-head">
        <div className="container editorial-hero">
          <div className="editorial-hero-copy"><h1>{locale === "es" ? "Conecta las piezas." : "Connect the pieces."}</h1><p className="lead">{locale === "es" ? "Herramientas independientes que trabajan con Moodle de formas distintas. Descubre qué conexión necesita cada una y adónde van los datos." : "Independent tools, different ways to work with Moodle. See which connection each one needs and where your data goes."}</p><a className="button button-accent" href="#connect-title">{locale === "es" ? "Ver las conexiones" : "Explore the connections"}<ArrowIcon /></a></div>
          <EditorialArt kind="reuse" eager />
        </div>
      </section>

      <section className="section" aria-labelledby="connect-title">
        <div className="container">
          <h2 id="connect-title">{text.connectTitle}</h2>
          <div className="two-up connection-paths">
            {text.connect.map((item, index) => (
              <article className="panel" key={item.title}>
                <div className="connection-map" aria-hidden="true"><span>{locale === "es" ? "Tu herramienta" : "Your tool"}</span><svg viewBox="0 0 60 20"><path d="M0 10h55m-8-8 9 8-9 8" fill="none" stroke="currentColor" strokeWidth="2"/></svg><span>{index === 0 ? "Core" : "MoodlIA"}</span><svg viewBox="0 0 60 20"><path d="M0 10h55m-8-8 9 8-9 8" fill="none" stroke="currentColor" strokeWidth="2"/></svg><span>Moodle</span></div>
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
          <p><a href="https://github.com/gafapa">github.com/gafapa <ArrowIcon /></a></p>
        </div>
      </section>

      <div className="container"><HelpBox locale={locale} /></div>
    </PageShell>
  );
}
