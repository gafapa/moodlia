import { apps, getApp, levels, tasks, type Locale } from "./content";
import { alternates, appPath, contactEmail, faq, pagePath, siteUrl, ui } from "./i18n";
import { pageMetadata } from "./seo";
import { AppCard, HelpBox, LevelTag, PageShell, appsByLevel } from "./ui-kit";
import { ConnectionLanes } from "./how-page";

const homeMeta = {
  en: {
    title: "MoodlIA — Open-source tools for Moodle",
    description: "Ten free, open-source apps for Moodle: import rubrics, convert backups, analyze courses, and let AI assistants and scripts work with Moodle safely. With installation guides.",
  },
  es: {
    title: "MoodlIA — Herramientas de código abierto para Moodle",
    description: "Diez apps gratuitas y de código abierto para Moodle: importa rúbricas, convierte copias de seguridad, analiza cursos y deja que asistentes de IA y scripts trabajen con Moodle de forma segura. Con guías de instalación.",
  },
};

export function homeMetadata(locale: Locale) {
  return pageMetadata({ locale, ...homeMeta[locale], alternate: alternates("home") });
}

export function HomePage({ locale }: { locale: Locale }) {
  const copy = ui[locale].home;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "MoodlIA",
        url: `${siteUrl}/`,
        email: `mailto:${contactEmail}`,
        sameAs: ["https://github.com/gafapa"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}${pagePath("home", locale)}`,
        name: "MoodlIA",
        description: homeMeta[locale].description,
        inLanguage: locale,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "ItemList",
        name: copy.appsTitle,
        itemListElement: apps.map((app, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}${appPath(app.slug, locale)}`,
          name: app.name,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faq[locale].map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <PageShell locale={locale} alternate={alternates("home")} structuredData={structuredData}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="hero-title">{copy.title}</h1>
            <p className="lead">{copy.intro}</p>
            <div className="actions">
              <a className="button button-accent" href={pagePath("apps", locale)}>{copy.ctaApps}</a>
              <a className="button button-ghost" href={pagePath("install", locale)}>{copy.ctaInstall}</a>
            </div>
          </div>
          <ol className="hero-levels" aria-label={copy.appsBody}>
            {appsByLevel().map(({ level, apps: group }) => (
              <li key={level} className={`level-${level}`}>
                <LevelTag level={level} locale={locale} />
                <p>{levels[level].body[locale]}</p>
                <ul>
                  {group.map((app) => <li key={app.slug}><a href={appPath(app.slug, locale)}>{app.name.replace(/^MoodlIA /, "")}</a></li>)}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="tasks-title">
        <div className="container">
          <header className="section-head">
            <h2 id="tasks-title">{copy.tasksTitle}</h2>
            <p>{copy.tasksBody}</p>
          </header>
          <ul className="task-grid">
            {tasks.map((task) => {
              const app = getApp(task.app)!;
              return (
                <li key={task.app}>
                  <a href={appPath(app.slug, locale)}>
                    <strong>{task.text[locale]}</strong>
                    <span>{app.name} →</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="apps-title">
        <div className="container">
          <header className="section-head">
            <h2 id="apps-title">{copy.appsTitle}</h2>
            <p>{copy.appsBody}</p>
          </header>
          {appsByLevel().map(({ level, apps: group }) => (
            <div className="level-group" key={level}>
              <div className="level-group-head">
                <LevelTag level={level} locale={locale} />
                <p>{levels[level].body[locale]}</p>
              </div>
              <div className="card-grid">
                {group.map((app) => <AppCard key={app.slug} app={app} locale={locale} />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <header className="section-head">
            <h2 id="how-title">{copy.howTitle}</h2>
            <p>{copy.howBody}</p>
          </header>
          <ConnectionLanes locale={locale} />
          <p className="section-link"><a href={pagePath("how", locale)}>{copy.howLink} →</a></p>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="faq-title">
        <div className="container narrow">
          <h2 id="faq-title">{copy.faqTitle}</h2>
          <div className="faq">
            {faq[locale].map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <HelpBox locale={locale} title={copy.helpTitle} body={copy.helpBody} />
      </div>
    </PageShell>
  );
}
