import Image from "next/image";
import type { WaySlug } from "./catalog";
import {
  getLocalizedWayProducts,
  getLocalizedWays,
  interfaceCopy,
  localizePath,
  type Locale,
} from "./localization";
import { SiteFooter, SiteHeader } from "./site-chrome";

const homeAnchors: Record<WaySlug, string> = {
  "ai-integration": "work-with-ai",
  "teaching-tools": "teach-with-confidence",
  "learning-insights": "understand-what-matters",
};

export default function Home() {
  return <MoodliaHome locale="en" />;
}

export function MoodliaHome({ locale }: { locale: Locale }) {
  const copy = interfaceCopy[locale];
  const homeCopy = copy.homePage;
  const paths = getLocalizedWays(locale).map((way) => ({
    ...way,
    id: homeAnchors[way.slug],
    products: getLocalizedWayProducts(way.slug, locale),
  }));
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://moodlia.com/#organization",
        name: "MoodlIA",
        url: "https://moodlia.com/",
        email: "mailto:contact@moodlia.com",
        contactPoint: {
          "@type": "ContactPoint",
          email: "contact@moodlia.com",
          contactType: locale === "es" ? "atención al usuario" : "customer support",
        },
        knowsAbout: [
          "Moodle",
          locale === "es" ? "Inteligencia artificial" : "Artificial intelligence",
          locale === "es" ? "Herramientas docentes" : "Teaching tools",
          locale === "es" ? "Analítica del aprendizaje" : "Learning analytics",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://moodlia.com/#website",
        url: `https://moodlia.com${localizePath(locale, "/")}`,
        name: "MoodlIA",
        description: locale === "es"
          ? "Tres formas conectadas de trabajar con Moodle, enseñar con más facilidad y comprender lo importante."
          : "Three connected ways to make Moodle easier to connect, teach with, and understand.",
        publisher: { "@id": "https://moodlia.com/#organization" },
        inLanguage: locale,
      },
      {
        "@type": "ItemList",
        name: locale === "es" ? "Tres formas en las que MoodlIA facilita Moodle" : "Three ways MoodlIA makes Moodle easier",
        itemListElement: paths.map((path, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Thing",
            name: path.title,
            description: path.description,
            hasPart: path.products.map((product) => ({
              "@type": "SoftwareApplication",
              name: product.name,
              description: product.description,
              applicationCategory: "EducationalApplication",
            })),
          },
        })),
      },
    ],
  };

  return (
    <>
      <a className="skip-link" href="#main-content" lang={locale}>{copy.skip}</a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <SiteHeader locale={locale} currentPath="/" />

      <main id="main-content" lang={locale}>
        <section className="selection-hero" aria-labelledby="hero-title">
          <div className="hero-grid">
            <div className="hero-copy">
              <h1 id="hero-title">
                {homeCopy.title.map((line, index) => (
                  <span className={index === 2 ? "hero-third-line" : undefined} key={line}>{line}</span>
                ))}
              </h1>
              <p className="hero-intro">{homeCopy.intro}</p>
              <div className="hero-actions">
                <a className="primary-action" href="#projects">{homeCopy.explore}</a>
                <a className="text-action" href="mailto:contact@moodlia.com">{homeCopy.ask}<span aria-hidden="true">↗</span></a>
              </div>
              <p className="hero-proof"><span aria-hidden="true">●</span>{homeCopy.note}</p>
              <p className="margin-note" aria-hidden="true">{locale === "es" ? "hecho para personas" : "made for people"}</p>
            </div>

            <div className="hero-photo-stack" role="group" aria-label={locale === "es" ? "Tres momentos docentes en los que MoodlIA puede ayudar" : "Three teaching moments where MoodlIA can help"}>
              {paths.map((path, index) => (
                <figure className={`hero-photo hero-photo-${index + 1}`} key={path.slug}>
                  <Image
                    src={path.image}
                    alt={path.imageAlt}
                    width={1120}
                    height={1400}
                    sizes="(max-width: 820px) 42vw, 23vw"
                    priority
                    unoptimized
                  />
                  <figcaption>{path.shortTitle}</figcaption>
                  <span className="hero-photo-number" aria-hidden="true">{path.number.padStart(2, "0")}</span>
                </figure>
              ))}
            </div>
          </div>

          <nav className="sequence-nav" aria-label={locale === "es" ? "Las tres formas en que MoodlIA puede ayudarte" : "The three ways MoodlIA can help"}>
            <span className="sequence-playhead" aria-hidden="true" />
            {paths.map((path) => (
              <a href={`#${path.id}`} key={path.slug}>
                <span>{path.number.padStart(2, "0")}</span>
                <strong>{path.shortTitle}</strong>
                <i aria-hidden="true">→</i>
              </a>
            ))}
          </nav>
        </section>

        <section className="selections" id="projects" aria-labelledby="projects-title">
          <header className="selections-heading">
            <h2 id="projects-title">{homeCopy.movementsTitle}</h2>
            <p>{homeCopy.movementsBody}</p>
          </header>

          <div className="selection-list">
            {paths.map((path, index) => (
              <article className={`selection-item selection-item-${index + 1}`} id={path.id} aria-labelledby={`${path.id}-title`} key={path.slug}>
                <figure className="selection-image">
                  <Image
                    src={path.image}
                    alt={path.imageAlt}
                    width={1120}
                    height={1400}
                    sizes="(max-width: 820px) 94vw, 46vw"
                    loading={index === 0 ? "eager" : "lazy"}
                    unoptimized
                  />
                  <figcaption>{path.imageCaption}</figcaption>
                  <span aria-hidden="true">{path.number.padStart(2, "0")}</span>
                </figure>

                <div className="selection-copy">
                  <h3 id={`${path.id}-title`}>{path.title}</h3>
                  <p>{path.description}</p>
                  <ol className="product-tracklist" aria-label={`${path.title} projects`}>
                    {path.products.map((product, productIndex) => (
                      <li key={product.slug}>
                        <a href={localizePath(locale, `/products/${product.slug}`)}>
                          <span>{String(productIndex + 1).padStart(2, "0")}</span>
                          <strong>{product.name}</strong>
                          <i aria-hidden="true">↗</i>
                        </a>
                      </li>
                    ))}
                  </ol>
                  <a className="open-selection" href={localizePath(locale, `/ways/${path.slug}`)}>{homeCopy.exploreWay}<span aria-hidden="true">→</span></a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="help-selection" id="help" aria-labelledby="help-title">
          <div className="help-number" aria-hidden="true">3</div>
          <div className="help-copy">
            <h2 id="help-title">{homeCopy.helpTitle}</h2>
            <p>{homeCopy.helpBody}</p>
            <a href="mailto:contact@moodlia.com">contact@moodlia.com<span aria-hidden="true">↗</span></a>
          </div>
          <p className="help-note">{homeCopy.helpMechanism}</p>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}
