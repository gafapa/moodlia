import Image from "next/image";

const paths = [
  {
    id: "work-with-ai",
    number: "01",
    label: "Connect",
    title: "Work with AI",
    description: "Bring the AI tools you already use closer to Moodle and turn ideas into action faster.",
    products: ["MoodlIA Moodle Plugin", "MoodlIA CLI", "Moodle Core CLI", "MoodlIA Skills"],
    image: "/moodlia-ai-integration.jpg",
    imageAlt: "A connected network representing AI working together with Moodle",
  },
  {
    id: "teach-with-confidence",
    number: "02",
    label: "Teach",
    title: "Teach with confidence",
    description: "Create rubrics, review work, and make thoughtful corrections with less repetitive effort.",
    products: ["MoodlIA Rubrics", "MoodlIA Corrector", "Chrome extensions"],
    image: "/moodlia-teaching-tools.jpg",
    imageAlt: "A teacher reviewing rubric and assessment cards with confidence",
  },
  {
    id: "understand-what-matters",
    number: "03",
    label: "Understand",
    title: "See what matters",
    description: "Turn course activity into clear priorities, useful signals, and better-timed support.",
    products: ["MoodlIA Teacher Dashboard", "MoodlIA Analyzer Web", "MoodlIA Analyzer Desktop"],
    image: "/moodlia-learning-analytics.jpg",
    imageAlt: "Clear learning progress and course insights emerging from Moodle data",
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
      email: "mailto:contact@moodlia.com",
      sameAs: ["https://github.com/gafapa"],
      contactPoint: {
        "@type": "ContactPoint",
        email: "contact@moodlia.com",
        contactType: "customer support",
      },
      knowsAbout: ["Moodle", "Artificial intelligence", "Teaching tools", "Learning analytics"],
    },
    {
      "@type": "WebSite",
      "@id": "https://moodlia.com/#website",
      url: "https://moodlia.com/",
      name: "MoodlIA",
      description: "Three open project areas that make Moodle easier to connect, teach with, and understand.",
      publisher: { "@id": "https://moodlia.com/#organization" },
      inLanguage: "en",
    },
    {
      "@type": "ItemList",
      name: "Three ways MoodlIA improves Moodle",
      itemListElement: paths.map((path, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: { "@type": "Thing", name: path.title, description: path.description },
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

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="MoodlIA home">
          Moodl<span>IA</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#three-ways">Three ways</a>
          <a href="#help">Get help</a>
        </nav>
        <a className="header-contact" href="mailto:contact@moodlia.com">Contact us</a>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">One open family of Moodle tools</p>
          <h1 id="hero-title">Three ways to make Moodle work better for you.</h1>
          <p className="hero-lede">Less repetitive work. More confident teaching. Clearer decisions.</p>
          <div className="hero-actions">
            <a className="primary-action" href="#three-ways">Find your way <span aria-hidden="true">↓</span></a>
            <a className="text-action" href="mailto:contact@moodlia.com">Ask us anything <span aria-hidden="true">↗</span></a>
          </div>
        </div>

        <div className="three-stage" aria-hidden="true">
          <span className="three-number">3</span>
          {paths.map((path, index) => (
            <div className={`three-image three-image-${index + 1}`} key={path.id}>
              <Image src={path.image} alt="" width={512} height={1024} unoptimized priority />
              <span>{path.number}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="three-ways" id="three-ways" aria-labelledby="three-ways-title">
        <div className="section-heading">
          <p className="eyebrow">The power of three</p>
          <h2 id="three-ways-title">Choose what you need today.</h2>
        </div>

        <div className="path-list">
          {paths.map((path) => (
            <article className="path-card" id={path.id} key={path.id}>
              <div className="path-image">
                <Image
                  src={path.image}
                  alt={path.imageAlt}
                  width={512}
                  height={1024}
                  sizes="(max-width: 760px) 100vw, 38vw"
                  unoptimized
                />
              </div>
              <div className="path-copy">
                <div className="path-meta">
                  <span>{path.number}</span>
                  <p>{path.label}</p>
                </div>
                <h3>{path.title}</h3>
                <p className="path-description">{path.description}</p>
                <ul aria-label={`${path.title} projects`}>
                  {path.products.map((product) => <li key={product}>{product}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="help" id="help" aria-labelledby="help-title">
        <div className="help-number" aria-hidden="true">?</div>
        <div className="help-copy">
          <p className="eyebrow">Here when you need us</p>
          <h2 id="help-title">Tell us what you want to do.</h2>
          <p>
            We help anyone who needs it with anything related to MoodlIA—from choosing a tool
            and getting started to solving a problem or shaping a new idea.
          </p>
          <a href="mailto:contact@moodlia.com">contact@moodlia.com <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <footer>
        <div className="wordmark">Moodl<span>IA</span></div>
        <p>Connect · Teach · Understand</p>
        <a href="mailto:contact@moodlia.com">contact@moodlia.com</a>
      </footer>
    </main>
  );
}
