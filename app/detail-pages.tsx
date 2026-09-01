import type { Metadata } from "next";
import Image from "next/image";
import type { MoodliaProduct, MoodliaWay } from "./catalog";
import {
  getLocalizedRelatedProducts,
  getLocalizedWay,
  getLocalizedWayProducts,
  getPracticalGuide,
  interfaceCopy,
  localizePath,
  type Locale,
} from "./localization";
import { SiteFooter, SiteHeader } from "./site-chrome";

const siteUrl = "https://moodlia.com";

function detailMetadata(
  title: string,
  description: string,
  path: string,
  image: string,
  imageAlt: string,
  locale: Locale,
): Metadata {
  const absoluteImage = `${siteUrl}${image}`;
  const fullTitle = `${title} | MoodlIA`;
  const canonicalPath = localizePath(locale, path);
  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: { en: path, es: localizePath("es", path), "x-default": path },
    },
    openGraph: {
      title: fullTitle,
      description,
      url: `${siteUrl}${canonicalPath}`,
      siteName: "MoodlIA",
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "website",
      images: [{ url: absoluteImage, width: 1120, height: 1400, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteImage],
    },
  };
}

export function createWayMetadata(way: MoodliaWay, locale: Locale) {
  return detailMetadata(way.shortTitle, way.introduction, `/ways/${way.slug}`, way.image, way.imageAlt, locale);
}

export function createProductMetadata(product: MoodliaProduct, locale: Locale) {
  const way = getLocalizedWay(product.waySlug, locale);
  if (!way) throw new Error(`Missing way for ${product.slug}`);
  return detailMetadata(product.name, product.description, `/products/${product.slug}`, way.image, `${product.name}: ${way.imageAlt}`, locale);
}

function Breadcrumb({ locale, items }: { locale: Locale; items: Array<{ label: string; href?: string }> }) {
  const copy = interfaceCopy[locale];
  return (
    <nav className="breadcrumb" aria-label={locale === "es" ? "Migas de pan" : "Breadcrumb"}>
      <a href={localizePath(locale, "/")}>{copy.home}</a>
      {items.map((item) => (
        <span className="breadcrumb-item" key={`${item.label}-${item.href ?? "current"}`}>
          <i aria-hidden="true">/</i>
          {item.href ? <a href={localizePath(locale, item.href)}>{item.label}</a> : <span>{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

function DetailHelp({ subject, locale }: { subject: string; locale: Locale }) {
  const copy = interfaceCopy[locale];
  return (
    <section className="detail-help" aria-labelledby="detail-help-title">
      <h2 id="detail-help-title">{copy.helpTitlePrefix} {subject}?</h2>
      <p>{copy.helpBody}</p>
      <a href="mailto:contact@moodlia.com">{copy.writeTo}<span aria-hidden="true">↗</span></a>
      <span className="detail-help-mark" aria-hidden="true">?</span>
    </section>
  );
}

export function WayDetailPage({ way, locale }: { way: MoodliaWay; locale: Locale }) {
  const copy = interfaceCopy[locale];
  const currentPath = `/ways/${way.slug}`;
  const wayProducts = getLocalizedWayProducts(way.slug, locale);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${way.shortTitle} | MoodlIA`,
    url: `${siteUrl}${localizePath(locale, currentPath)}`,
    description: way.introduction,
    hasPart: wayProducts.map((product) => ({
      "@type": "SoftwareApplication",
      name: product.name,
      description: product.description,
      url: `${siteUrl}${localizePath(locale, `/products/${product.slug}`)}`,
      applicationCategory: "EducationalApplication",
    })),
  };

  return (
    <>
      <a className="skip-link" href="#main-content" lang={locale}>{copy.skip}</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <SiteHeader locale={locale} currentPath={localizePath(locale, currentPath)} alternatePath={locale === "es" ? currentPath : localizePath("es", currentPath)} />
      <main id="main-content" className="detail-main" lang={locale}>
        <section className={`detail-hero way-detail-hero route-${way.number}`} aria-labelledby="detail-title">
          <div className="detail-hero-copy">
            <Breadcrumb locale={locale} items={[{ label: way.shortTitle }]} />
            <h1 id="detail-title">{way.title}</h1>
            <p>{way.introduction}</p>
            <a className="primary-action" href="#way-products">{copy.meetProjects}</a>
          </div>
          <figure className="detail-hero-figure">
            <Image src={way.image} alt={way.imageAlt} width={1120} height={1400} sizes="(max-width: 820px) 94vw, 42vw" priority unoptimized />
            <figcaption>{way.imageCaption}</figcaption>
            <span aria-hidden="true">{way.number.padStart(2, "0")}</span>
          </figure>
        </section>

        <section className="way-products" id="way-products" aria-labelledby="way-products-title">
          <header>
            <h2 id="way-products-title">{copy.partsTitle}</h2>
            <p>{way.description}</p>
          </header>
          <ol className="way-tracklist">
            {wayProducts.map((product, index) => (
              <li key={product.slug}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{product.name}</h3><p>{product.description}</p></div>
                <a href={localizePath(locale, `/products/${product.slug}`)} aria-label={`${copy.exploreProduct} ${product.name}`}>→</a>
              </li>
            ))}
          </ol>
        </section>

        <section className="way-outcomes" aria-labelledby="way-outcomes-title">
          <div>
            <h2 id="way-outcomes-title">{copy.unlocksTitle}</h2>
          </div>
          <ol>{way.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ol>
        </section>

        <DetailHelp subject={way.shortTitle.toLowerCase()} locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}

export function ProductDetailPage({ product, locale }: { product: MoodliaProduct; locale: Locale }) {
  const copy = interfaceCopy[locale];
  const currentPath = `/products/${product.slug}`;
  const way = getLocalizedWay(product.waySlug, locale);
  if (!way) throw new Error(`Missing way for ${product.slug}`);
  const relatedProducts = getLocalizedRelatedProducts(product, locale);
  const practicalGuide = getPracticalGuide(product.slug, locale);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    url: `${siteUrl}${localizePath(locale, currentPath)}`,
    description: product.description,
    applicationCategory: "EducationalApplication",
    isPartOf: { "@type": "WebSite", name: "MoodlIA", url: siteUrl },
    codeRepository: product.sourceUrl,
  };

  return (
    <>
      <a className="skip-link" href="#main-content" lang={locale}>{copy.skip}</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <SiteHeader locale={locale} currentPath={localizePath(locale, currentPath)} alternatePath={locale === "es" ? currentPath : localizePath("es", currentPath)} />
      <main id="main-content" className="detail-main" lang={locale}>
        <section className={`detail-hero product-detail-hero route-${way.number}`} aria-labelledby="detail-title">
          <div className="detail-hero-copy">
            <Breadcrumb locale={locale} items={[{ label: way.shortTitle, href: `/ways/${way.slug}` }, { label: product.name }]} />
            <h1 id="detail-title">{product.name}</h1>
            <p className="product-lede">{product.description}</p>
            <div className="detail-actions">
              <a className="primary-action" href={product.sourceUrl}>{product.sourceLabel}</a>
              <a className="text-action" href="#how-to-start">{copy.seeHowToStart}</a>
              <a className="text-action" href="mailto:contact@moodlia.com">{copy.askAboutProject}<span aria-hidden="true">↗</span></a>
            </div>
            <p className="detail-meta">{product.kind}<span aria-hidden="true">·</span>{product.status}</p>
          </div>
          <figure className="detail-hero-figure product-hero-figure">
            <Image src={way.image} alt={way.imageAlt} width={1120} height={1400} sizes="(max-width: 820px) 94vw, 42vw" priority unoptimized />
            <figcaption>{way.imageCaption}</figcaption>
            <span aria-hidden="true">{way.number.padStart(2, "0")}</span>
          </figure>
        </section>

        <section className="product-overview" aria-labelledby="product-overview-title">
          <div className="product-introduction">
            <h2 id="product-overview-title">{copy.builtForTitle}</h2>
            <p>{product.introduction}</p>
            {product.secondaryUrl && product.secondaryLabel ? <a href={product.secondaryUrl}>{product.secondaryLabel}<span aria-hidden="true">↗</span></a> : null}
          </div>

          <div className="product-columns">
            <section aria-labelledby="highlights-title"><p>01</p><h3 id="highlights-title">{copy.helpsWithTitle}</h3><ul>{product.highlights.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section aria-labelledby="best-for-title"><p>02</p><h3 id="best-for-title">{copy.fitTitle}</h3><ul>{product.bestFor.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section aria-labelledby="requirements-title"><p>03</p><h3 id="requirements-title">{copy.requirementsTitle}</h3><ul>{product.requirements.map((item) => <li key={item}>{item}</li>)}</ul></section>
          </div>
        </section>

        <section className="product-start" id="how-to-start" aria-labelledby="product-start-title">
          <header>
            <h2 id="product-start-title">{copy.startHereTitle}</h2>
            <p>{product.startGuide.adminNote}</p>
          </header>
          <div className="product-start-steps">
            <section aria-labelledby="install-title">
              <h3 id="install-title">{copy.installTitle}</h3>
              <ol>{product.startGuide.install.map((step) => <li key={step}>{step}</li>)}</ol>
            </section>
            <section aria-labelledby="first-use-title">
              <h3 id="first-use-title">{copy.firstUseTitle}</h3>
              <ol>{product.startGuide.firstUse.map((step) => <li key={step}>{step}</li>)}</ol>
            </section>
          </div>
          <a className="open-selection" href="mailto:contact@moodlia.com">{copy.startHereLink}<span aria-hidden="true">↗</span></a>
        </section>

        {practicalGuide ? (
          <section className="practical-guide" aria-labelledby="practical-guide-title">
            <header>
              <p>{locale === "es" ? "PASOS CONCRETOS" : "CONCRETE STEPS"}</p>
              <h2 id="practical-guide-title">{practicalGuide.title}</h2>
              <span>{practicalGuide.introduction}</span>
            </header>
            {practicalGuide.availability ? (
              <aside className="practical-guide-availability" aria-label={practicalGuide.availability.title}>
                <strong>{practicalGuide.availability.title}</strong>
                <p>{practicalGuide.availability.description}</p>
              </aside>
            ) : null}
            <ol>
              {practicalGuide.steps.map((step) => (
                <li key={step.title}>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    {step.command ? <pre><code>{step.command}</code></pre> : null}
                    {step.action ? <a className="text-action" href={step.action.href}>{step.action.label}<span aria-hidden="true">↗</span></a> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {relatedProducts.length ? (
          <section className="related-products" aria-labelledby="related-products-title">
            <header><h2 id="related-products-title">{copy.connectedTitle}</h2></header>
            <div>{relatedProducts.map((related, index) => <a href={localizePath(locale, `/products/${related.slug}`)} key={related.slug}><span>{String(index + 1).padStart(2, "0")}</span><strong>{related.name}</strong><i aria-hidden="true">→</i></a>)}</div>
            <a className="open-selection" href={localizePath(locale, `/ways/${way.slug}`)}>{copy.exploreAllPrefix} {way.shortTitle.toLowerCase()} {copy.exploreAllSuffix}<span aria-hidden="true">→</span></a>
          </section>
        ) : null}

        <DetailHelp subject={product.name} locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
