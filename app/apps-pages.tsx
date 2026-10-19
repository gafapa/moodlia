import { apps, places, productFamilies, type Locale, type MoodliaApp } from "./content";
import { alternates, appPath, pagePath, siteUrl, ui } from "./i18n";
import { pageMetadata } from "./seo";
import { ArrowIcon } from "./icons";
import { AppCard, HelpBox, PageShell, Rich, StatusTag, StepList } from "./ui-kit";
import { EditorialArt, ToolJourney, artForTool, type ArtKind } from "./editorial-art";
import { ExtensionPrivacyLink } from "./extension-privacy-link";

const familyVisuals: Record<string, { kind: ArtKind; en: string; es: string }> = {
  connect: { kind: "teaching", en: "Connect", es: "Conectar" },
  assess: { kind: "assessment", en: "Assess", es: "Evaluar" },
  reuse: { kind: "reuse", en: "Create and reuse", es: "Crear y reutilizar" },
  "follow-up": { kind: "teaching", en: "Follow up", es: "Hacer seguimiento" },
};

const indexMeta = {
  en: { title: "Tools for your Moodle work | MoodlIA", description: "Connect AI to Moodle, prepare assessment, reuse course content and follow up on courses. Requirements and installation for each tool." },
  es: { title: "Herramientas para trabajar con Moodle | MoodlIA", description: "Conecta la IA con Moodle, prepara la evaluación, reutiliza contenidos y haz seguimiento de tus cursos. Requisitos e instalación de cada herramienta." },
};

export function appsIndexMetadata(locale: Locale) {
  return pageMetadata({ locale, ...indexMeta[locale], alternate: alternates("apps") });
}

export function AppsIndexPage({ locale }: { locale: Locale }) {
  const copy = ui[locale].apps;
  return (
    <PageShell locale={locale} current="apps" alternate={alternates("apps")}>
      <section className="page-head">
        <div className="container editorial-hero">
          <div className="editorial-hero-copy"><h1>{locale === "es" ? "Herramientas para enseñar." : "Tools for teaching."}</h1><p className="lead">{copy.intro}</p><nav className="family-nav" aria-label={locale === "es" ? "Elige una tarea" : "Choose a task"}>{productFamilies.map(family => <a key={family.id} href={`#family-${family.id}`}>{familyVisuals[family.id][locale]}<ArrowIcon /></a>)}</nav></div>
          <EditorialArt kind="teaching" eager />
        </div>
      </section>
      <div className="container">
        {productFamilies.map((family) => (
          <section className="level-group product-family" key={family.id} aria-labelledby={`family-${family.id}`}>
            <div className="level-group-head family-overview">
              <h2 id={`family-${family.id}`}>{familyVisuals[family.id][locale]}</h2>
              <p>{family.body[locale]}</p>
              <EditorialArt kind={familyVisuals[family.id].kind} />
            </div>
            <div className="card-grid">
              {family.apps.map((slug) => <AppCard key={slug} app={apps.find((app) => app.slug === slug)!} locale={locale} />)}
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
  const family = productFamilies.find((item) => item.apps.includes(app.slug));
  const others = apps.filter((other) => other.slug !== app.slug && family?.apps.includes(other.slug)).slice(0, 3);
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
          <nav className="breadcrumb" aria-label={locale === "es" ? "Ruta de navegación" : "Breadcrumb"}><a href={pagePath("apps", locale)}>{copy.breadcrumb}</a> <span aria-hidden="true">/</span> <span>{app.name}</span></nav>
          <div className="editorial-hero tool-hero"><div className="editorial-hero-copy">
          <h1>{app.name.replace(/^MoodlIA /, "")}</h1>
          <p className="lead">{app.summary[locale]}</p>
          <div className="app-head-tags"><span className="tag place">{places[app.place].title[locale]}</span><StatusTag app={app} locale={locale} /></div>
          <div className="actions">
            <a className="button button-accent" href={app.get.href} {...(isExternal(app.get.href) ? { rel: "noopener" } : {})}>{app.get.label[locale]}</a>
            <a className="button button-ghost" href="#install">{copy.install}</a>
          </div>
          <ExtensionPrivacyLink slug={app.slug} locale={locale} />
          </div><EditorialArt kind={artForTool(app.slug)} eager caption={locale === "es" ? "Del material docente al trabajo en Moodle." : "From teaching material to work in Moodle."} /></div>
        </div>
      </section>
      <div className="container"><ToolJourney slug={app.slug} locale={locale} /></div>

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
              <details className="step-group install-disclosure" key={group.title.en} open>
                <summary>{group.title[locale]}</summary>
                <StepList steps={group.steps} locale={locale} />
              </details>
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
              {app.version ? <div><dt>{copy.version}</dt><dd>{app.version}</dd></div> : null}
              <div><dt>{copy.license}</dt><dd>{app.license}</dd></div>
            </dl>
            <h2>{copy.docs}</h2>
            <ul className="link-list">
              {app.docs.map((doc) => <li key={doc.href}><a href={doc.href}>{doc.label[locale]} <ArrowIcon /></a></li>)}
              <li><a href={app.source}>{copy.sourceLink} <ArrowIcon /></a></li>
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
