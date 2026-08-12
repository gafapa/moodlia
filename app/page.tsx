const products = [
  {
    eyebrow: "Automation",
    name: "MoodlIA Plugin",
    description:
      "A permission-aware Moodle plugin that exposes one operation model through REST and MCP.",
    detail: "Courses · activities · questions · grading · backups",
  },
  {
    eyebrow: "Terminal",
    name: "Moodle Core CLI",
    description:
      "A safe Node.js client and command-line interface for standard Moodle web services. No plugin required.",
    detail: "Moodle 5.x · typed operations · read-only defaults",
  },
  {
    eyebrow: "Assessment",
    name: "MoodlIA Rubrics",
    description:
      "Import complete Moodle rubrics from CSV without rebuilding every criterion and level by hand.",
    detail: "Chrome extension · CSV import · multilingual",
  },
  {
    eyebrow: "Grading",
    name: "MoodlIA Corrector",
    description:
      "Review assignment evidence and apply teacher-approved AI correction suggestions to Moodle grading forms.",
    detail: "Human review · rubric-aware · browser extension",
  },
  {
    eyebrow: "Teaching",
    name: "Teacher Dashboard",
    description:
      "Bring courses, deadlines, resources, and the next useful teaching actions into one focused workspace.",
    detail: "Frontend-only · Moodle REST · local settings",
  },
  {
    eyebrow: "Insights",
    name: "MoodlIA Analyzer",
    description:
      "Understand participation, assessment trends, and students who may benefit from timely support.",
    detail: "Web and desktop · adaptive metrics · reports",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="MoodlIA home">
          Moodl<span>IA</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#products">Products</a>
          <a href="#principles">Principles</a>
          <a href="#studio">Studio</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">Open tools for Moodle</p>
          <h1>Build better courses. Automate careful work. See where to act.</h1>
          <p className="hero-lede">
            MoodlIA is a family of focused tools for teachers, course designers,
            developers, and learning teams working with Moodle.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#products">Explore the projects</a>
            <a className="secondary-action" href="#principles">How MoodlIA works</a>
          </div>
        </div>
        <aside className="hero-panel" aria-label="MoodlIA capabilities">
          <p className="panel-label">One Moodle ecosystem</p>
          <ol>
            <li><span>01</span> Create and manage</li>
            <li><span>02</span> Grade with oversight</li>
            <li><span>03</span> Analyze and intervene</li>
          </ol>
          <p className="panel-note">Moodle remains the source of truth.</p>
        </aside>
      </section>

      <section className="product-section" id="products">
        <div className="section-heading">
          <p className="kicker">Products</p>
          <h2>Small tools with clear boundaries.</h2>
          <p>Use one project on its own or combine them around the same Moodle site.</p>
        </div>
        <div className="product-grid">
          {products.map((product, index) => (
            <article className="product-card" key={product.name}>
              <div className="card-topline">
                <span>{product.eyebrow}</span>
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <small>{product.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="principles" id="principles">
        <div>
          <p className="kicker">Principles</p>
          <h2>Automation should remain understandable.</h2>
        </div>
        <div className="principle-list">
          <article>
            <strong>Permission-aware</strong>
            <p>Respect Moodle capabilities, contexts, and the authority of the connected user.</p>
          </article>
          <article>
            <strong>Reviewable</strong>
            <p>Keep writes, destructive actions, and AI-assisted changes explicit and inspectable.</p>
          </article>
          <article>
            <strong>Portable</strong>
            <p>Prefer content and workflows that survive normal Moodle backup, restore, and reuse.</p>
          </article>
          <article>
            <strong>Independent</strong>
            <p>Release focused projects separately while keeping their interfaces compatible.</p>
          </article>
        </div>
      </section>

      <section className="studio" id="studio">
        <div className="studio-status">Concept</div>
        <div>
          <p className="kicker">MoodlIA Studio</p>
          <h2>A visual course workspace, when the workflow is ready.</h2>
          <p>
            Studio is currently an idea, not an implementation. It may become a guided
            interface for course structure, question banks, grading designs, previews,
            and publication checks over the existing MoodlIA operation model.
          </p>
        </div>
      </section>

      <footer>
        <div className="wordmark">Moodl<span>IA</span></div>
        <p>Open tools for creating, automating, and understanding Moodle courses.</p>
        <p className="copyright">moodlia.com · Project workspace</p>
      </footer>
    </main>
  );
}
