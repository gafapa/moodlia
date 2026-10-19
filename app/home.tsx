import { apps, type Locale } from "./content";
import { alternates, appPath, contactEmail, faq, pagePath, siteUrl } from "./i18n";
import { pageMetadata } from "./seo";
import { PageShell } from "./ui-kit";
import { ArrowIcon } from "./icons";
import { cinematicCopy } from "./cinematic-copy";
import { CourseArt } from "./course-art";
import { StoryMotion } from "./story-motion";
import { StartingPoint } from "./starting-point";
import { ExtensionPrivacyLink } from "./extension-privacy-link";
import "./cinematic.css";

const homeMeta = {
  en: { title: "MoodlIA — Open-source tools for Moodle", description: "From a teaching idea to a Moodle course. Discover open-source tools for course preparation, rubric import, reviewed feedback and content reuse." },
  es: { title: "MoodlIA — Herramientas de código abierto para Moodle", description: "De una idea docente a un curso en Moodle. Descubre herramientas abiertas para preparar, evaluar, acompañar y reutilizar tu trabajo." },
};

export function homeMetadata(locale: Locale) {
  return pageMetadata({ locale, ...homeMeta[locale], alternate: alternates("home") });
}

export function HomePage({ locale }: { locale: Locale }) {
  const copy = cinematicCopy[locale];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: "MoodlIA", url: `${siteUrl}/`, email: `mailto:${contactEmail}`, sameAs: ["https://github.com/gafapa"] },
      { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: `${siteUrl}${pagePath("home", locale)}`, name: "MoodlIA", description: homeMeta[locale].description, inLanguage: locale },
      { "@type": "ItemList", name: copy.allTools, itemListElement: apps.map((app, index) => ({ "@type": "ListItem", position: index + 1, url: `${siteUrl}${appPath(app.slug, locale)}`, name: app.name })) },
      { "@type": "FAQPage", mainEntity: faq[locale].map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) },
    ],
  };
  return <PageShell locale={locale} alternate={alternates("home")} structuredData={structuredData} appearance="story">
    <div className="cinematic-home">
      <section className="poster-hero" aria-labelledby="hero-title">
        <h1 className="poster-title" id="hero-title"><span>{copy.title[0]}</span><span>{copy.title[1]}</span></h1>
        <div className="poster-intro"><p>{copy.intro}</p><a className="story-button" href="#workflow">{copy.action}<ArrowIcon /></a><p className="poster-note">{copy.heroNote}</p></div>
        <div className="poster-art"><CourseArt kind="idea" copy={copy} /></div>
      </section>
      <section className="story-argument" aria-labelledby="argument-title" data-enter><h2 id="argument-title">{copy.argument}</h2><p>{copy.argumentBody}</p></section>
      <StoryMotion locale={locale} />
      <section className="course-story scene" data-scene="teaching-journey" id="workflow" aria-label={locale === "es" ? "El recorrido de una idea docente" : "The journey of a teaching idea"}>
        <div className="story-stage scene-stage">
          <div className="story-progress" aria-hidden="true">{copy.stages.map(stage => <span key={stage.id}>{stage.verb}</span>)}</div>
          {copy.stages.map(stage => <article className={`story-panel panel-${stage.id}`} id={`chapter-${stage.id}`} key={stage.id}>
            <div className="chapter-copy"><h2>{stage.title}</h2><p className="chapter-name">{stage.name}</p><p className="chapter-body">{stage.body}</p><a className="chapter-link" href={appPath(stage.slug, locale)}>{stage.action}<ArrowIcon /></a><ExtensionPrivacyLink slug={stage.slug} locale={locale} /><p className="chapter-note">{stage.note}</p></div>
            <figure className="chapter-art"><CourseArt kind={stage.id} copy={copy} /><figcaption>{copy.sample}</figcaption></figure>
          </article>)}
        </div>
      </section>
      <section className="story-interlude" data-enter aria-labelledby="independent-title"><h2 id="independent-title">{copy.breakTitle}</h2><p>{copy.breakBody}</p></section>
      <section className="story-start" aria-labelledby="start-title"><h2 id="start-title">{copy.chooseTitle}</h2><StartingPoint locale={locale} /><noscript><p><a className="story-button" href={appPath("rubrics", locale)}>{copy.choiceActions[1]}</a></p></noscript></section>
      <section className="story-trust" aria-labelledby="trust-title" data-enter><h2 id="trust-title">{copy.trustTitle}</h2><div>{copy.trust.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div><p className="story-source">{copy.source}</p></section>
      <section className="story-directory" aria-labelledby="directory-title" data-enter><div><h2 id="directory-title">{copy.toolsTitle}</h2><p>{copy.toolsBody}</p><a className="story-button" href={pagePath("apps", locale)}>{copy.allTools}<ArrowIcon /></a></div><nav aria-label={copy.toolsTitle}><a href={appPath("backup-converter", locale)}>Backup Converter<ArrowIcon /></a><a href={appPath("edx-converter", locale)}>edX Converter<ArrowIcon /></a><a href={appPath("cli", locale)}>MoodlIA CLI<ArrowIcon /></a><a href={appPath("skills", locale)}>MoodlIA Skills<ArrowIcon /></a><a href={`${appPath("moodle-plugin", locale)}#install`}>{locale === "es" ? "Instalación para centros" : "Institution setup"}<ArrowIcon /></a></nav></section>
      <section className="story-faq" aria-labelledby="faq-title"><h2 id="faq-title">{copy.faqTitle}</h2><div>{faq[locale].map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div></section>
      <section className="story-close" aria-labelledby="close-title"><p>{copy.closeBody}</p><h2 id="close-title">{copy.close}</h2><a href={`mailto:${contactEmail}`} className="story-button">{copy.contact}<ArrowIcon /></a></section>
      <details className="lesson-credits"><summary>{locale === "es" ? "Sobre las ilustraciones" : "About the illustrations"}</summary><p>{locale === "es" ? "Ilustraciones editoriales creadas para MoodlIA con herramientas de IA. Representan materiales docentes y flujos de trabajo; las guías explican las funciones reales de cada herramienta." : "Editorial illustrations created for MoodlIA with AI tools. They depict teaching materials and workflows; the guides explain each tool's actual functionality."}</p></details>
      <noscript><style>{`.story-motion-control{display:none}`}</style></noscript>
    </div>
  </PageShell>;
}
