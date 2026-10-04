import type { ReactNode } from "react";
import { apps, levels, places, type Level, type Locale, type MoodliaApp, type Step } from "./content";
import { appPath, contactEmail, pagePath, ui } from "./i18n";

export function Logo() {
  return (
    <svg className="logo" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
      <rect width="512" height="512" rx="112" fill="#07464a" />
      <circle cx="244" cy="244" r="156" fill="#ff6847" />
      <rect x="158" y="226" width="36" height="104" rx="18" fill="#fff" />
      <rect x="226" y="172" width="36" height="158" rx="18" fill="#fff" />
      <rect x="294" y="204" width="36" height="126" rx="18" fill="#fff" />
      <circle cx="357" cy="357" r="71" fill="#07464a" stroke="#f3f7f5" strokeWidth="20" />
      <circle cx="357" cy="357" r="28" fill="#c9f65b" />
    </svg>
  );
}

type NavKey = "apps" | "install" | "how";

export function SiteHeader({ locale, current, alternate }: { locale: Locale; current?: NavKey; alternate: { en: string; es: string } }) {
  const copy = ui[locale];
  const links: Array<[NavKey, string]> = [
    ["apps", pagePath("apps", locale)],
    ["install", pagePath("install", locale)],
    ["how", pagePath("how", locale)],
  ];
  return (
    <header className="site-header" lang={locale}>
      <div className="container header-inner">
        <a className="wordmark" href={pagePath("home", locale)} aria-label={copy.homeLabel}>
          <Logo />
          <span>MoodlIA</span>
        </a>
        <nav className="main-nav" aria-label={copy.navLabel}>
          {links.map(([key, href]) => (
            <a key={key} href={href} aria-current={current === key ? "page" : undefined}>{copy.nav[key]}</a>
          ))}
          <a href={`mailto:${contactEmail}`}>{copy.nav.help}</a>
        </nav>
        <div className="lang-switch" role="group" aria-label={copy.language}>
          <a href={alternate.en} hrefLang="en" lang="en" aria-current={locale === "en" ? "true" : undefined}>EN</a>
          <a href={alternate.es} hrefLang="es" lang="es" aria-current={locale === "es" ? "true" : undefined}>ES</a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = ui[locale];
  const legal = locale === "es"
    ? { legal: "/es/aviso-legal", privacy: "/es/privacy", cookies: "/es/cookies" }
    : { legal: "/legal-notice", privacy: "/privacy", cookies: "/cookies" };
  return (
    <footer className="site-footer" lang={locale}>
      <div className="container footer-inner">
        <div className="footer-brand">
          <a className="wordmark" href={pagePath("home", locale)} aria-label={copy.homeLabel}><Logo /><span>MoodlIA</span></a>
          <p>{copy.footer}</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <a href={pagePath("apps", locale)}>{copy.nav.apps}</a>
          <a href={pagePath("install", locale)}>{copy.nav.install}</a>
          <a href={pagePath("how", locale)}>{copy.nav.how}</a>
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          <a href="https://github.com/gafapa">GitHub</a>
          <a href={legal.legal}>{copy.legal}</a>
          <a href={legal.privacy}>{copy.privacy}</a>
          <a href={legal.cookies}>{copy.cookies}</a>
        </nav>
      </div>
    </footer>
  );
}

/** Skip link, header, main landmark, and footer shared by every page. */
export function PageShell({
  locale, current, alternate, structuredData, children,
}: {
  locale: Locale;
  current?: NavKey;
  alternate: { en: string; es: string };
  structuredData?: object;
  children: ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main" lang={locale}>{ui[locale].skip}</a>
      {structuredData ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      ) : null}
      <SiteHeader locale={locale} current={current} alternate={alternate} />
      <main id="main" lang={locale}>{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}

/** A code block with a copy button; the button is wired by the small script in the layout. */
export function CodeBlock({ code, locale }: { code: string; locale: Locale }) {
  return (
    <div className="code-block">
      <pre><code>{code}</code></pre>
      <button type="button" className="copy-button" data-copy data-copied-label={ui[locale].copied}>{ui[locale].copy}</button>
    </div>
  );
}

/** Renders text where `backticks` mark code, such as commands, paths, and Moodle capabilities. */
export function Rich({ text }: { text: string }) {
  return <>{text.split(/`([^`]+)`/).map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part))}</>;
}

export function StepList({ steps, locale, start = 1 }: { steps: Step[]; locale: Locale; start?: number }) {
  return (
    <ol className="steps" start={start}>
      {steps.map((step) => (
        <li key={step.text.en}>
          <p><Rich text={step.text[locale]} /></p>
          {step.code ? <CodeBlock code={step.code} locale={locale} /> : null}
        </li>
      ))}
    </ol>
  );
}

const levelMarks: Record<Level, string> = { browser: "1", local: "2", technical: "3" };

export function LevelTag({ level, locale }: { level: Level; locale: Locale }) {
  return <span className={`tag level-${level}`}><i aria-hidden="true">{levelMarks[level]}</i>{levels[level].title[locale]}</span>;
}

export function StatusTag({ app, locale }: { app: MoodliaApp; locale: Locale }) {
  const copy = ui[locale].app;
  return (
    <span className={`tag status-${app.status}`}>
      {copy.status[app.status]}{app.version ? ` · ${app.version}` : ""}
    </span>
  );
}

export function AppCard({ app, locale, headingLevel = 3 }: { app: MoodliaApp; locale: Locale; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="app-card">
      <div className="app-card-tags">
        <span className="tag place">{places[app.place].title[locale]}</span>
        <StatusTag app={app} locale={locale} />
      </div>
      <Heading><a href={appPath(app.slug, locale)}>{app.name}</a></Heading>
      <p>{app.summary[locale]}</p>
      <span className="app-card-more" aria-hidden="true">{ui[locale].apps.open} →</span>
    </article>
  );
}

export function HelpBox({ locale, title, body }: { locale: Locale; title?: string; body?: string }) {
  const copy = ui[locale];
  return (
    <section className="help-box" aria-labelledby="help-title">
      <div>
        <h2 id="help-title">{title ?? copy.helpTitle}</h2>
        <p>{body ?? copy.helpBody}</p>
      </div>
      <a className="button button-light" href={`mailto:${contactEmail}`}>{contactEmail}</a>
    </section>
  );
}

export function appsByLevel() {
  return (["browser", "local", "technical"] as Level[]).map((level) => ({ level, apps: apps.filter((app) => app.level === level) }));
}
