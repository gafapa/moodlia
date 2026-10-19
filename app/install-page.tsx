import { apps, placeOrder, places, type Locale } from "./content";
import { alternates, appPath, pagePath, siteUrl, ui } from "./i18n";
import { pageMetadata } from "./seo";
import { ArrowIcon } from "./icons";
import { HelpBox, PageShell, StepList } from "./ui-kit";
import { EditorialArt, artForTool } from "./editorial-art";
import { ExtensionPrivacyLink } from "./extension-privacy-link";

const meta = {
  en: { title: "Installation guide | MoodlIA", description: "How to install every MoodlIA app: Chrome Web Store, Moodle Marketplace, npm, or from source, with the exact steps and commands." },
  es: { title: "Guía de instalación | MoodlIA", description: "Cómo instalar cada app de MoodlIA: Chrome Web Store, Moodle Marketplace, npm o desde el código, con los pasos y comandos exactos." },
};

export function installMetadata(locale: Locale) {
  return pageMetadata({ locale, ...meta[locale], alternate: alternates("install") });
}

export function InstallPage({ locale }: { locale: Locale }) {
  const copy = ui[locale].install;
  const groups = placeOrder
    .map((place) => ({ place, apps: apps.filter((app) => app.place === place) }))
    .filter((group) => group.apps.length > 0);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: meta[locale].title,
    itemListElement: apps.map((app, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}${appPath(app.slug, locale)}#install`,
      name: app.name,
    })),
  };

  return (
    <PageShell locale={locale} current="install" alternate={alternates("install")} structuredData={structuredData}>
      <section className="page-head">
        <div className="container editorial-hero">
          <div className="editorial-hero-copy"><h1>{locale === "es" ? "Tu primer paso." : "Your first step."}</h1><p className="lead">{copy.intro}</p><a className="button button-accent" href="#rubrics">{locale === "es" ? "Empezar por Rubrics" : "Start with Rubrics"}</a></div>
          <EditorialArt kind="assessment" eager />
        </div>
        <div className="container">
          <nav className="jump-nav" aria-label={copy.jump}>
            {apps.map((app) => <a key={app.slug} href={`#${app.slug}`}>{app.name.replace(/^MoodlIA /, "")}</a>)}
          </nav>
        </div>
      </section>

      <div className="container installation-content">
        {groups.map(({ place, apps: group }) => (
          <section className="install-group" key={place} aria-labelledby={`place-${place}`}>
            <header>
              <h2 id={`place-${place}`}>{places[place].title[locale]}</h2>
              <p>{places[place].body[locale]}</p>
            </header>
            {group.map((app) => (
              <article className="install-item" id={app.slug} key={app.slug} aria-labelledby={`${app.slug}-title`}>
                <div className="install-item-head">
                  <EditorialArt kind={artForTool(app.slug)} className="install-thumbnail" />
                  <div>
                    <h3 id={`${app.slug}-title`}><a href={appPath(app.slug, locale)}>{app.name}</a></h3>
                    <p>{app.summary[locale]}</p>
                    <ExtensionPrivacyLink slug={app.slug} locale={locale} />
                  </div>
                </div>
                <details className="install-disclosure" open={app.slug === "rubrics"}>
                <summary>{app.install[0].title[locale]}</summary>
                <StepList steps={app.install[0].steps} locale={locale} />
                <div className="actions">
                  <a className="button button-accent" href={app.get.href}>{app.get.label[locale]}</a>
                  <a className="button button-ghost" href={`${appPath(app.slug, locale)}#install`}>{copy.full} <ArrowIcon /></a>
                </div>
                </details>
              </article>
            ))}
          </section>
        ))}
        <section className="choose" aria-labelledby="choose-title">
          <h2 id="choose-title">{copy.chooseTitle}</h2>
          <p><a href={pagePath("home", locale)}>{copy.chooseBody}</a></p>
        </section>
        <HelpBox locale={locale} />
      </div>
    </PageShell>
  );
}
