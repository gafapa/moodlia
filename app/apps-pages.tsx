import { apps, levels, places, type Locale, type MoodliaApp } from "./content";
import { alternates, appPath, pagePath, siteUrl, ui } from "./i18n";
import { pageMetadata } from "./seo";
import { AppCard, HelpBox, LevelTag, PageShell, Rich, StatusTag, StepList, appsByLevel } from "./ui-kit";

const indexMeta = {
  en: { title: "All apps | MoodlIA", description: "The ten MoodlIA apps for Moodle: what each one does, who can install it, and how to get it." },
  es: { title: "Todas las apps | MoodlIA", description: "Las diez apps de MoodlIA para Moodle: qué hace cada una, quién puede instalarla y cómo conseguirla." },
};

export function appsIndexMetadata(locale: Locale) {
  return pageMetadata({ locale, ...indexMeta[locale], alternate: alternates("apps") });
}

export function AppsIndexPage({ locale }: { locale: Locale }) {
  const copy = ui[locale].apps;
  return (
    <PageShell locale={locale} current="apps" alternate={alternates("apps")}>
      <section className="page-head">
        <div className="container narrow">
          <h1>{copy.title}</h1>
          <p className="lead">{copy.intro}</p>
        </div>
      </section>
      <div className="container">
        {appsByLevel().map(({ level, apps: group }) => (
          <section className="level-group" key={level} aria-labelledby={`level-${level}`}>
            <div className="level-group-head">
              <h2 id={`level-${level}`}><LevelTag level={level} locale={locale} /></h2>
              <p>{levels[level].body[locale]}</p>
            </div>
            <div className="card-grid">
              {group.map((app) => <AppCard key={app.slug} app={app} locale={locale} />)}
            </div>
          </section>
        ))}
        <HelpBox locale={locale} />
      </div>
    </PageShell>
  );
}

export function appMetadata(app: MoodliaApp, locale: Locale) {
  return pageMetadata({
    locale,
    title: `${app.name} | MoodlIA`,
    description: app.summary[locale],
    alternate: alternates("apps", app.slug),
  });
}

function isExternal(href: string) {
  return href.startsWith("http");
}

export function AppPage({ app, locale }: { app: MoodliaApp; locale: Locale }) {
  const copy = ui[locale].app;
  const others = apps.filter((other) => other.slug !== app.slug && other.level === app.level).slice(0, 3);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.name,
    description: app.description[locale].replaceAll("`", ""),
    url: `${siteUrl}${appPath(app.slug, locale)}`,
    applicationCategory: "EducationalApplication",
    operatingSystem: app.place === "browser" ? "Web browser" : "Windows, macOS, Linux",
    ...(app.version ? { softwareVersion: app.version } : {}),
    license: `https://spdx.org/licenses/${app.license}.html`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    inLanguage: locale,
  };

  return (
    <PageShell locale={locale} current="apps" alternate={alternates("apps", app.slug)} structuredData={structuredData}>
      <section className="app-head">
        <div className="container">
          <p className="breadcrumb"><a href={pagePath("apps", locale)}>{copy.breadcrumb}</a> <span aria-hidden="true">/</span> <span>{app.name}</span></p>
          <div className="app-head-tags">
            <span className="tag place">{places[app.place].title[locale]}</span>
            <StatusTag app={app} locale={locale} />
          </div>
          <h1>{app.name}</h1>
          <p className="lead">{app.summary[locale]}</p>
          <div className="actions">
            <a className="button button-accent" href={app.get.href} {...(isExternal(app.get.href) ? { rel: "noopener" } : {})}>{app.get.label[locale]}</a>
            <a className="button button-ghost" href="#install">{copy.install}</a>
          </div>
        </div>
      </section>

      <div className="container app-layout">
        <article className="app-main">
          <p className="app-description"><Rich text={app.description[locale]} /></p>

          <section aria-labelledby="does-title">
            <h2 id="does-title">{copy.whatItDoes}</h2>
            <ul className="check-list">{app.does.map((item) => <li key={item.en}><Rich text={item[locale]} /></li>)}</ul>
          </section>

          <section aria-labelledby="needs-title">
            <h2 id="needs-title">{copy.needs}</h2>
            <ul className="need-list">{app.needs.map((item) => <li key={item.en}><Rich text={item[locale]} /></li>)}</ul>
          </section>

          <section id="install" aria-labelledby="install-title">
            <h2 id="install-title">{copy.install}</h2>
            {app.install.map((group) => (
              <div className="step-group" key={group.title.en}>
                <h3>{group.title[locale]}</h3>
                <StepList steps={group.steps} locale={locale} />
              </div>
            ))}
          </section>

          <section aria-labelledby="first-use-title">
            <h2 id="first-use-title">{copy.firstUse}</h2>
            <StepList steps={app.firstUse} locale={locale} />
          </section>

          <section aria-labelledby="limits-title">
            <h2 id="limits-title">{copy.limits}</h2>
            <ul className="note-list">{app.limits.map((item) => <li key={item.en}><Rich text={item[locale]} /></li>)}</ul>
          </section>
        </article>

        <aside className="app-side" aria-label={app.name}>
          <div className="side-card">
            <a className="button button-accent button-block" href={app.get.href}>{app.get.label[locale]}</a>
            <dl>
              <div><dt>{copy.levelLabel}</dt><dd><LevelTag level={app.level} locale={locale} /></dd></div>
              {app.version ? <div><dt>{copy.version}</dt><dd>{app.version}</dd></div> : null}
              <div><dt>{copy.license}</dt><dd>{app.license}</dd></div>
            </dl>
            <h2>{copy.docs}</h2>
            <ul className="link-list">
              {app.docs.map((doc) => <li key={doc.href}><a href={doc.href}>{doc.label[locale]} ↗</a></li>)}
              <li><a href={app.source}>{copy.sourceLink} ↗</a></li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="container">
        {others.length > 0 ? (
          <section className="others" aria-labelledby="others-title">
            <h2 id="others-title">{copy.other}</h2>
            <div className="card-grid">{others.map((other) => <AppCard key={other.slug} app={other} locale={locale} />)}</div>
          </section>
        ) : null}
        <HelpBox locale={locale} />
      </div>
    </PageShell>
  );
}
