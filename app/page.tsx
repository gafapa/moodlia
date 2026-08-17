const areas = [
  {
    id: "ai-integration",
    number: "01",
    label: "AI integration",
    title: "Connect Moodle to AI",
    description:
      "Give assistants and agents a secure, understandable way to work with Moodle through MCP and command-line tools.",
    projects: ["MoodlIA Moodle Plugin", "MoodlIA CLI", "Moodle Core CLI", "MoodlIA Skills"],
    note: "MCP · CLI · shared operation model",
  },
  {
    id: "teaching-tools",
    number: "02",
    label: "Teaching tools",
    title: "Make daily teaching lighter",
    description:
      "Practical browser tools for creating rubrics, reviewing evidence, and keeping teachers in control of every correction.",
    projects: ["MoodlIA Rubrics", "MoodlIA Corrector", "Chrome extensions"],
    note: "Rubrics · correction · human review",
  },
  {
    id: "analytics",
    number: "03",
    label: "Analysis and insight",
    title: "See where to act",
    description:
      "Turn Moodle activity into a focused view of courses, progress, assessment trends, and students who may need support.",
    projects: ["Teacher Dashboard", "MoodlIA Analyzer Web", "MoodlIA Analyzer Desktop"],
    note: "Dashboard · indicators · reports",
  },
];

export default function Home() {
  return (
    <main id="top">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="MoodlIA home">
          Moodl<span>IA</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#ai-integration">Integrate</a>
          <a href="#teaching-tools">Teach</a>
          <a href="#analytics">Understand</a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <p className="kicker">Open tools for Moodle</p>
        <h1 id="hero-title">One project.<br />Three ways to improve Moodle.</h1>
        <div className="hero-footer">
          <p>
            MoodlIA is a family of independent tools that connect Moodle to AI,
            help teachers with everyday work, and make learning activity easier
            to understand.
          </p>
          <a className="primary-action" href="#areas">Discover MoodlIA</a>
        </div>
      </section>

      <section className="areas" id="areas" aria-labelledby="areas-title">
        <div className="section-intro">
          <p className="kicker">The MoodlIA ecosystem</p>
          <h2 id="areas-title">Start with what you need.</h2>
          <p>Each area works on its own. Together, they form a clearer way to build, teach, and decide in Moodle.</p>
        </div>

        <div className="area-grid">
          {areas.map((area) => (
            <article className="area-card" id={area.id} key={area.id}>
              <div className="area-heading">
                <span className="area-number" aria-hidden="true">{area.number}</span>
                <p>{area.label}</p>
              </div>
              <h3>{area.title}</h3>
              <p className="area-description">{area.description}</p>
              <ul aria-label={`${area.label} projects`}>
                {area.projects.map((project) => <li key={project}>{project}</li>)}
              </ul>
              <p className="area-note">{area.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="closing" aria-labelledby="closing-title">
        <p className="kicker">Built in the open</p>
        <h2 id="closing-title">Focused tools.<br />Shared foundations.</h2>
        <p>
          Every MoodlIA project has a clear purpose and can evolve independently,
          while remaining compatible with the rest of the ecosystem.
        </p>
        <a href="https://github.com/gafapa" target="_blank" rel="noreferrer">View the projects on GitHub <span aria-hidden="true">↗</span></a>
      </section>

      <footer>
        <div className="wordmark">Moodl<span>IA</span></div>
        <p>Open tools for a more connected, practical, and understandable Moodle.</p>
        <p className="copyright">moodlia.com · 2026</p>
      </footer>
    </main>
  );
}
