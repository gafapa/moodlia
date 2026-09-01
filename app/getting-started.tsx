import type { Metadata } from "next";
import Image from "next/image";
import { getLocalizedWayProducts, getLocalizedWays, interfaceCopy, localizePath, type Locale } from "./localization";
import { SiteFooter, SiteHeader } from "./site-chrome";

const siteUrl = "https://moodlia.com";

export function createGettingStartedMetadata(locale: Locale): Metadata {
  const copy = interfaceCopy[locale].startPage;
  const path = locale === "es" ? "/es/empezar" : "/start";
  const englishPath = "/start";
  const spanishPath = "/es/empezar";
  const title = locale === "es" ? "Empieza con MoodlIA" : "Start with MoodlIA";

  return {
    title: `${title} | MoodlIA`,
    description: copy.intro,
    alternates: {
      canonical: path,
      languages: { en: englishPath, es: spanishPath, "x-default": englishPath },
    },
    openGraph: {
      title: `${title} | MoodlIA`,
      description: copy.intro,
      url: `${siteUrl}${path}`,
      siteName: "MoodlIA",
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
      images: [{
        url: `${siteUrl}/moodlia-start-here-brand.png`,
        width: 1536,
        height: 1024,
        alt: copy.imageAlt,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MoodlIA`,
      description: copy.intro,
      images: [`${siteUrl}/moodlia-start-here-brand.png`],
    },
  };
}

export function GettingStartedPage({ locale }: { locale: Locale }) {
  const copy = interfaceCopy[locale];
  const pageCopy = copy.startPage;
  const currentPath = locale === "es" ? "/es/empezar" : "/start";
  const ways = getLocalizedWays(locale);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: locale === "es" ? "Cómo empezar con MoodlIA" : "How to start with MoodlIA",
    description: pageCopy.intro,
    inLanguage: locale,
    step: pageCopy.startSteps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text,
    })),
  };

  return (
    <>
      <a className="skip-link" href="#main-content" lang={locale}>{copy.skip}</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <SiteHeader locale={locale} currentPath={currentPath} alternatePath={locale === "es" ? "/start" : "/es/empezar"} />
      <main id="main-content" className="start-main" lang={locale}>
        <section className="start-hero" aria-labelledby="start-title">
          <div className="start-hero-copy">
            <p className="breadcrumb"><a href={localizePath(locale, "/")}>{copy.home}</a><span className="breadcrumb-item"><i aria-hidden="true">/</i><span>{copy.startNav}</span></span></p>
            <h1 id="start-title">{pageCopy.title}</h1>
            <p>{pageCopy.intro}</p>
            <a className="primary-action" href="#choose-a-way">{locale === "es" ? "Elige una forma de avanzar" : "Choose a way forward"}</a>
          </div>
          <figure className="start-hero-figure">
            <Image src="/moodlia-start-here-brand.png" alt={pageCopy.imageAlt} width={1536} height={1024} sizes="(max-width: 820px) 94vw, 55vw" priority unoptimized />
            <figcaption><Image src="/favicon.svg" alt="MoodlIA" width={58} height={58} unoptimized /><span>{locale === "es" ? "Un comienzo tranquilo, con ayuda a mano" : "A calm start, with help close by"}</span></figcaption>
          </figure>
        </section>

        <section className="start-ways" id="choose-a-way" aria-labelledby="start-ways-title">
          <header>
            <h2 id="start-ways-title">{pageCopy.chooseTitle}</h2>
            <p>{pageCopy.chooseBody}</p>
          </header>
          <ol>
            {ways.map((way) => (
              <li className={`route-${way.number}`} key={way.slug}>
                <a href={localizePath(locale, `/ways/${way.slug}`)}>
                  <span>{way.number.padStart(2, "0")}</span>
                  <strong>{way.title}</strong>
                  <p>{way.description}</p>
                  <i aria-hidden="true">→</i>
                </a>
              </li>
            ))}
          </ol>
        </section>

        <section className="start-steps" aria-labelledby="start-steps-title">
          <header><h2 id="start-steps-title">{pageCopy.startTitle}</h2></header>
          <ol>{pageCopy.startSteps.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>

        <section className="start-tool-guides" aria-labelledby="start-tool-guides-title">
          <header>
            <h2 id="start-tool-guides-title">{pageCopy.toolsTitle}</h2>
            <p>{pageCopy.toolsBody}</p>
          </header>
          <div>
            {ways.map((way) => (
              <article className={`route-${way.number}`} key={way.slug} aria-labelledby={`guide-${way.slug}`}>
                <h3 id={`guide-${way.slug}`}>{way.shortTitle}</h3>
                <ol>
                  {getLocalizedWayProducts(way.slug, locale).map((product) => (
                    <li key={product.slug}>
                      <div>
                        <a href={localizePath(locale, `/products/${product.slug}`)}><strong>{product.name}</strong></a>
                        <p><b>{pageCopy.installLabel}</b> {product.startGuide.install[0]}</p>
                        <p><b>{pageCopy.useLabel}</b> {product.startGuide.firstUse[0]}</p>
                      </div>
                      <a className="open-selection" href={localizePath(locale, `/products/${product.slug}`)}>{pageCopy.openProductGuide}<span aria-hidden="true">→</span></a>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section className="start-support" aria-labelledby="start-support-title">
          <div className="start-support-logo" aria-hidden="true"><Image src="/favicon.svg" alt="" width={94} height={94} unoptimized /></div>
          <div>
            <h2 id="start-support-title">{pageCopy.supportTitle}</h2>
            <p>{pageCopy.supportBody}</p>
            <a href="mailto:contact@moodlia.com">{pageCopy.supportAction}<span aria-hidden="true">↗</span></a>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
