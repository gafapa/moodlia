import { interfaceCopy, localizePath, type Locale } from "./localization";

export function SiteHeader({ locale, currentPath }: { locale: Locale; currentPath: string }) {
  const copy = interfaceCopy[locale];

  return (
    <header className="site-header" lang={locale}>
      <a className="wordmark" href={localizePath(locale, "/")} aria-label={copy.homeLabel}>
        <span className="brand-tracks" aria-hidden="true"><i /><i /><i /></span>
        <span>MoodlIA</span>
      </a>
      <nav aria-label={copy.navigation}>
        <a href={`${localizePath(locale, "/")}#projects`}>{copy.waysNav}</a>
        <a href={`${localizePath(locale, "/")}#help`}>{copy.helpNav}</a>
      </nav>
      <div className="header-actions">
        <div className="language-switcher" role="group" aria-label={copy.language}>
          <a
            href={currentPath}
            hrefLang="en"
            lang="en"
            aria-label={copy.viewEnglish}
            aria-current={locale === "en" ? "page" : undefined}
          >
            EN
          </a>
          <a
            href={localizePath("es", currentPath)}
            hrefLang="es"
            lang="es"
            aria-label={copy.viewSpanish}
            aria-current={locale === "es" ? "page" : undefined}
          >
            ES
          </a>
        </div>
        <a className="header-contact" href="mailto:contact@moodlia.com">{copy.contact}</a>
      </div>
    </header>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = interfaceCopy[locale];

  return (
    <footer lang={locale}>
      <a className="wordmark" href={localizePath(locale, "/")} aria-label={copy.homeLabel}>
        <span className="brand-tracks" aria-hidden="true"><i /><i /><i /></span>
        <span>MoodlIA</span>
      </a>
      <p>{copy.footerTagline}</p>
      <div className="footer-links">
        <a href="mailto:contact@moodlia.com">contact@moodlia.com</a>
      </div>
    </footer>
  );
}
