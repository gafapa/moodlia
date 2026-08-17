import Image from "next/image";

const areas = [
  {
    id: "ai-integration",
    number: "01",
    label: "AI integration",
    title: "Connect Moodle to AI",
    description: "MCP and CLI tools that give AI a secure way to work with Moodle.",
    projects: ["MoodlIA Moodle Plugin", "MoodlIA CLI", "Moodle Core CLI", "MoodlIA Skills"],
    image: "/moodlia-ai-integration.jpg",
    imageAlt: "Editorial illustration of an AI network connecting modular Moodle tools",
  },
  {
    id: "teaching-tools",
    number: "02",
    label: "Teaching tools",
    title: "Teach with less friction",
    description: "Browser tools for rubrics, correction, and teacher-reviewed grading.",
    projects: ["MoodlIA Rubrics", "MoodlIA Corrector", "Chrome extensions"],
    image: "/moodlia-teaching-tools.jpg",
    imageAlt: "Editorial illustration of a teacher reviewing rubrics and assessment cards",
  },
  {
    id: "analytics",
    number: "03",
    label: "Learning analytics",
    title: "See what needs attention",
    description: "Clear dashboards and analysis for faster, better-informed decisions.",
    projects: ["MoodlIA Teacher Dashboard", "MoodlIA Analyzer Web", "MoodlIA Analyzer Desktop"],
    image: "/moodlia-learning-analytics.jpg",
    imageAlt: "Editorial illustration of Moodle learning analytics dashboards and progress charts",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://moodlia.com/#organization",
      name: "MoodlIA",
      url: "https://moodlia.com/",
      sameAs: ["https://github.com/gafapa"],
      knowsAbout: [
        "Moodle",
        "Artificial intelligence",
        "Model Context Protocol",
        "Rubric assessment",
        "Learning analytics",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://moodlia.com/#website",
      url: "https://moodlia.com/",
      name: "MoodlIA",
      description: "Open-source AI tools for Moodle integration, teaching, and learning analytics.",
      publisher: { "@id": "https://moodlia.com/#organization" },
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      name: "MoodlIA project areas",
      itemListElement: areas.map((area, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Thing",
          name: area.label,
          description: area.description,
        },
      })),
    },
  ],
};

export default function Home() {
  return (
    <main id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <div className="hero-shell">
        <header className="site-header">
          <a className="wordmark" href="#top" aria-label="MoodlIA home">
            Moodl<span>IA</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#ai-integration">Connect</a>
            <a href="#teaching-tools">Teach</a>
            <a href="#analytics">Understand</a>
          </nav>
          <a className="github-link" href="https://github.com/gafapa" target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Open-source AI tools for Moodle</p>
            <h1 id="hero-title">Moodle,<br />ready for what&apos;s next.</h1>
            <div className="hero-bottom">
              <p>Connect AI. Support teachers. Understand learning.</p>
              <a href="#projects" className="round-link" aria-label="Explore MoodlIA projects">
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className="hero-collage" aria-hidden="true">
            {areas.map((area, index) => (
              <div className={`hero-shot hero-shot-${index + 1}`} key={area.id}>
                <Image src={area.image} alt="" width={512} height={1024} unoptimized priority />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="projects" id="projects" aria-labelledby="projects-title">
        <div className="projects-heading">
          <p className="eyebrow">One ecosystem · Three areas</p>
          <h2 id="projects-title">Choose where to start.</h2>
        </div>

        <div className="project-grid">
          {areas.map((area) => (
            <article className="project-card" id={area.id} key={area.id}>
              <div className="project-visual">
                <Image
                  src={area.image}
                  alt={area.imageAlt}
                  width={512}
                  height={1024}
                  sizes="(max-width: 640px) 92vw, (max-width: 900px) 42vw, 32vw"
                  unoptimized
                />
                <span className="project-number" aria-hidden="true">{area.number}</span>
                <p className="project-label">{area.label}</p>
              </div>
              <div className="project-copy">
                <h3>{area.title}</h3>
                <p>{area.description}</p>
                <ul aria-label={`${area.label} projects`}>
                  {area.projects.map((project) => <li key={project}>{project}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="closing" aria-labelledby="closing-title">
        <p className="eyebrow">Built in the open</p>
        <h2 id="closing-title">Small tools.<br />Shared foundations.</h2>
        <a href="https://github.com/gafapa" target="_blank" rel="noreferrer">
          Explore MoodlIA on GitHub <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer>
        <div className="wordmark">Moodl<span>IA</span></div>
        <p>AI integration · Teaching tools · Learning analytics</p>
        <p className="copyright">moodlia.com · 2026</p>
      </footer>
    </main>
  );
}
