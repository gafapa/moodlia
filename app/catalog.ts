export type WaySlug = "ai-integration" | "teaching-tools" | "learning-insights";

export interface MoodliaWay {
  slug: WaySlug;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  introduction: string;
  image: string;
  imageAlt: string;
  imageCaption: string;
  outcomes: string[];
  productSlugs: string[];
}

export interface MoodliaProduct {
  slug: string;
  name: string;
  waySlug: WaySlug;
  kind: string;
  status: string;
  description: string;
  introduction: string;
  highlights: string[];
  bestFor: string[];
  requirements: string[];
  sourceUrl: string;
  sourceLabel: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
}

export const ways: MoodliaWay[] = [
  {
    slug: "ai-integration",
    number: "1",
    title: "Bring AI into Moodle",
    shortTitle: "AI integration",
    description: "Connect the AI tools you already use and turn ideas into Moodle actions faster.",
    introduction:
      "A connected set of tools for working with Moodle through AI assistants, terminals, scripts, and standard Moodle services—while Moodle remains in control.",
    image: "/moodlia-ai-companion-v2.jpg",
    imageAlt: "An educator planning a course with lesson notes and a laptop in a bright learning space",
    imageCaption: "AI that supports the way you already teach",
    outcomes: [
      "Create and maintain Moodle content through explicit, permission-aware actions.",
      "Choose between the MoodlIA plugin or Moodle's standard web services.",
      "Give AI assistants reusable guidance for safe, portable Moodle work.",
    ],
    productSlugs: ["moodle-plugin", "cli", "moodle-core-cli", "skills"],
  },
  {
    slug: "teaching-tools",
    number: "2",
    title: "Make teaching flow",
    shortTitle: "Teaching tools",
    description: "Create rubrics, review work, and give thoughtful feedback with less repetitive effort.",
    introduction:
      "Focused browser tools that meet teachers inside the Moodle pages they already use, reducing repetitive setup and review without removing teacher judgement.",
    image: "/moodlia-teaching-flow-v2.jpg",
    imageAlt: "An educator calmly reviewing student work and feedback cards",
    imageCaption: "More time for thoughtful teaching",
    outcomes: [
      "Move complete rubrics from a simple CSV file into Moodle.",
      "Review AI-assisted correction suggestions before anything reaches Moodle.",
      "Keep each extension focused on the Moodle pages where it is useful.",
    ],
    productSlugs: ["rubrics", "corrector", "chrome-extensions"],
  },
  {
    slug: "learning-insights",
    number: "3",
    title: "See what needs attention",
    shortTitle: "Learning insights",
    description: "Turn course activity into clear priorities, useful signals, and better-timed support.",
    introduction:
      "Browser and desktop tools that organise Moodle activity, deadlines, engagement, grade trends, and risk into views teachers can act on.",
    image: "/moodlia-learning-clarity-v2.jpg",
    imageAlt: "An educator reviewing a simple learning overview and three priority markers",
    imageCaption: "Clarity for the next helpful decision",
    outcomes: [
      "See courses, deadlines, resources, and direct actions in one teacher view.",
      "Identify participation trends and students who may need timely support.",
      "Choose a browser-based or standalone analysis workflow.",
    ],
    productSlugs: ["teacher-dashboard", "analyzer-web", "analyzer-desktop"],
  },
];

export const products: MoodliaProduct[] = [
  {
    slug: "moodle-plugin",
    name: "MoodlIA Moodle Plugin",
    waySlug: "ai-integration",
    kind: "Moodle local plugin",
    status: "Open-source project",
    description: "Gives trusted AI tools controlled access to Moodle actions and content.",
    introduction:
      "The server-side foundation for controlled Moodle automation. It exposes explicit operations through REST and a Moodle-hosted MCP endpoint while keeping Moodle permissions and records authoritative.",
    highlights: [
      "REST services and a Moodle-hosted MCP endpoint",
      "Operations for courses, activities, question banks, enrolments, files, audits, and backups",
      "Permission-aware workflows that do not bypass Moodle",
    ],
    bestFor: [
      "Teams connecting AI assistants directly to Moodle",
      "Administrators automating repeated course-building work",
      "Developers building controlled Moodle workflows",
    ],
    requirements: [
      "A Moodle site where a local plugin can be installed",
      "An authorised Moodle service user and token",
      "Only the permissions required by the intended workflow",
    ],
    sourceUrl: "https://github.com/gafapa/moodle-local_moodlia",
    sourceLabel: "View the plugin on GitHub",
    secondaryUrl: "https://github.com/gafapa/moodle-local_moodlia/issues",
    secondaryLabel: "Report or follow an issue",
  },
  {
    slug: "cli",
    name: "MoodlIA CLI",
    waySlug: "ai-integration",
    kind: "Command-line and Node client",
    status: "Published npm package",
    description: "Runs Moodle tasks from a terminal or repeatable workflow.",
    introduction:
      "The public command-line tool and reusable Node client for the MoodlIA Moodle Plugin. It brings the same operation contract to developer machines, scripts, and automation workers.",
    highlights: [
      "Connects directly to MoodlIA through REST",
      "Available as a global command or project dependency",
      "Includes a reusable client and generated TypeScript declarations",
    ],
    bestFor: [
      "People who prefer a terminal for repeatable Moodle work",
      "Scripts that build, inspect, or audit course content",
      "Automation workers that need the public MoodlIA client",
    ],
    requirements: [
      "Node.js 22 or later",
      "A Moodle site with the MoodlIA plugin installed",
      "A REST token enabled for the MoodlIA service",
    ],
    sourceUrl: "https://github.com/gafapa/moodlia-cli",
    sourceLabel: "View the CLI on GitHub",
    secondaryUrl: "https://www.npmjs.com/package/moodlia",
    secondaryLabel: "Open the npm package",
  },
  {
    slug: "moodle-core-cli",
    name: "Moodle Core CLI",
    waySlug: "ai-integration",
    kind: "Command-line and Node client",
    status: "Published npm package",
    description: "Works with Moodle's standard web services without installing a plugin.",
    introduction:
      "A friendly client and command-line interface for Moodle 5.0 and later core web services. It turns complex REST details into stable operations without requiring the MoodlIA plugin.",
    highlights: [
      "Uses Moodle core web services only",
      "Handles nested parameters, version checks, and response normalisation",
      "Exposes friendly operations instead of arbitrary remote calls",
    ],
    bestFor: [
      "Moodle sites that cannot install an additional plugin",
      "Developers who want a typed client for core services",
      "Controlled automation using standard Moodle capabilities",
    ],
    requirements: [
      "Node.js 22 or later",
      "Moodle 5.0 or later with REST web services enabled",
      "A token whose service exposes each required Moodle function",
    ],
    sourceUrl: "https://github.com/gafapa/moodle-core-cli",
    sourceLabel: "View Moodle Core CLI on GitHub",
    secondaryUrl: "https://www.npmjs.com/package/moodle-core-cli",
    secondaryLabel: "Open the npm package",
  },
  {
    slug: "skills",
    name: "MoodlIA Skills",
    waySlug: "ai-integration",
    kind: "Reusable AI-agent skills",
    status: "Open-source project",
    description: "Guides AI assistants when creating and managing Moodle content.",
    introduction:
      "A reusable set of Codex skills for operating Moodle through MoodlIA and designing accessible content that remains portable through normal Moodle backup and restore workflows.",
    highlights: [
      "Guidance for inspecting, creating, updating, publishing, and verifying Moodle entities",
      "Portable HTML and interactive content designed for normal Moodle workflows",
      "Validation against unsafe or remotely dependent content packages",
    ],
    bestFor: [
      "Educators working with an AI assistant on Moodle content",
      "Teams that need repeatable, documented agent behaviour",
      "Course content that must remain portable without MoodlIA at runtime",
    ],
    requirements: [
      "Codex or a compatible environment that can load reusable skills",
      "Public MoodlIA interfaces for Moodle operations",
    ],
    sourceUrl: "https://github.com/gafapa/moodlia-skills",
    sourceLabel: "View the skills on GitHub",
  },
  {
    slug: "rubrics",
    name: "MoodlIA Rubrics",
    waySlug: "teaching-tools",
    kind: "Browser extension",
    status: "Open-source project",
    description: "Imports complete Moodle rubrics from a simple CSV file.",
    introduction:
      "A focused browser extension that turns a CSV rubric into Moodle's rubric editor, avoiding repetitive manual entry while leaving the rubric available for normal review and editing.",
    highlights: [
      "Imports rubric criteria and levels from CSV",
      "Runs only on supported or explicitly approved Moodle hosts",
      "Uses a native CSV parser with no third-party runtime dependency",
    ],
    bestFor: [
      "Teachers preparing detailed Moodle grading rubrics",
      "Teams moving existing rubric tables into Moodle",
      "Repeated rubric setup across courses or sites",
    ],
    requirements: [
      "Chrome or another Chromium-based browser",
      "Access to a Moodle rubric editing page",
      "A correctly structured CSV rubric file",
    ],
    sourceUrl: "https://github.com/gafapa/moodlia-rubrics",
    sourceLabel: "View MoodlIA Rubrics on GitHub",
  },
  {
    slug: "corrector",
    name: "MoodlIA Corrector",
    waySlug: "teaching-tools",
    kind: "Chrome extension",
    status: "Open-source project",
    description: "Suggests assignment feedback and applies only teacher-approved corrections.",
    introduction:
      "A Chrome extension for reviewing Moodle assignment submissions with AI assistance. Suggestions remain under teacher control before they are applied to Moodle grading forms.",
    highlights: [
      "Works on Moodle assignment grading pages",
      "Normalises correction suggestions and rubric information",
      "Requires teacher approval before applying suggested changes",
    ],
    bestFor: [
      "Teachers reviewing many Moodle assignment submissions",
      "Rubric-based assessment with consistent feedback",
      "Educators who want AI assistance without automatic grading decisions",
    ],
    requirements: [
      "Google Chrome",
      "Access to a Moodle assignment grading page",
      "A configured external AI Runtime connection",
    ],
    sourceUrl: "https://github.com/gafapa/moodlia-corrector",
    sourceLabel: "View MoodlIA Corrector on GitHub",
  },
  {
    slug: "chrome-extensions",
    name: "MoodlIA Chrome Extensions",
    waySlug: "teaching-tools",
    kind: "Browser-tool family",
    status: "Project family",
    description: "Bring focused MoodlIA tools into the Moodle pages teachers already use.",
    introduction:
      "The browser side of MoodlIA keeps each tool close to the Moodle task it supports. Extensions request only the site access they need and avoid replacing Moodle's own teaching workflow.",
    highlights: [
      "Focused tools rather than one oversized browser extension",
      "Host access limited to supported or teacher-approved Moodle sites",
      "Current projects include MoodlIA Rubrics and MoodlIA Corrector",
    ],
    bestFor: [
      "Teachers who want help directly inside Moodle",
      "Schools that prefer small, task-specific browser tools",
      "Workflows where Moodle remains the visible place of work",
    ],
    requirements: [
      "Chrome or another supported Chromium-based browser",
      "Permission to install the chosen extension",
      "Access to the relevant Moodle editing or grading page",
    ],
    sourceUrl: "https://github.com/gafapa",
    sourceLabel: "Explore MoodlIA projects on GitHub",
  },
  {
    slug: "teacher-dashboard",
    name: "MoodlIA Teacher Dashboard",
    waySlug: "learning-insights",
    kind: "Browser dashboard",
    status: "Open-source project",
    description: "Brings courses, deadlines, resources, and direct links into one teacher view.",
    introduction:
      "A backend-free dashboard that connects directly to Moodle's REST services from the browser and organises the information teachers need for everyday course follow-up.",
    highlights: [
      "Consolidates courses, action deadlines, resources, and Moodle links",
      "Runs entirely in the browser without a custom backend",
      "Stores connection settings locally on the device",
    ],
    bestFor: [
      "Teachers working across several Moodle courses",
      "Quick daily checks of deadlines and course resources",
      "Sites that allow browser access to Moodle REST services",
    ],
    requirements: [
      "Moodle REST web services enabled",
      "A token with the required course and calendar functions",
      "A Moodle site whose CORS policy allows browser requests",
    ],
    sourceUrl: "https://github.com/gafapa/moodlia-teacher-dashboard",
    sourceLabel: "View the dashboard on GitHub",
  },
  {
    slug: "analyzer-web",
    name: "MoodlIA Analyzer Web",
    waySlug: "learning-insights",
    kind: "Browser application",
    status: "Open-source project",
    description: "Finds participation trends, student risk, and priorities in the browser.",
    introduction:
      "A frontend-only Moodle analysis workspace for course and student follow-up. It combines activity, participation, grades, risk, recommendations, and intervention priorities without a custom backend.",
    highlights: [
      "Course-wide analysis, student risk, recommendations, and intervention queues",
      "Trend comparisons, charts, filters, and CSV or JSON export",
      "Local profiles and analysis cache stored in the browser",
    ],
    bestFor: [
      "Teachers who want deeper course analysis without installing desktop software",
      "Student follow-up based on activity, participation, and grades",
      "Bilingual English and Spanish analysis workflows",
    ],
    requirements: [
      "A modern web browser",
      "Moodle REST access and a suitable token",
      "Optional browser bridge when Moodle blocks direct cross-site requests",
    ],
    sourceUrl: "https://github.com/gafapa/moodlia-analyzer-web",
    sourceLabel: "View Analyzer Web on GitHub",
  },
  {
    slug: "analyzer-desktop",
    name: "MoodlIA Analyzer Desktop",
    waySlug: "learning-insights",
    kind: "Desktop application",
    status: "Open-source project",
    description: "Provides course analysis in a standalone desktop application.",
    introduction:
      "A standalone application for analysing Moodle course activity, engagement, grade trends, and follow-up risk, with course dashboards, student views, charts, and optional AI-assisted reports.",
    highlights: [
      "Course dashboards and detailed student views",
      "Configurable passing threshold and conservative risk classification",
      "Local connection profiles with passwords kept only in memory",
    ],
    bestFor: [
      "Teachers who prefer a dedicated desktop workspace",
      "Course and student analysis with extensive visual detail",
      "Windows and Apple Silicon Mac workflows",
    ],
    requirements: [
      "A supported Windows or Apple Silicon Mac build",
      "Access to Moodle REST web services",
      "A token or credentials used to request one for the session",
    ],
    sourceUrl: "https://github.com/gafapa/moodlia-analyzer-desktop",
    sourceLabel: "View Analyzer Desktop on GitHub",
    secondaryUrl: "https://github.com/gafapa/moodlia-analyzer-desktop/actions",
    secondaryLabel: "Open available builds",
  },
];

export function getWay(slug: string) {
  return ways.find((way) => way.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getWayProducts(waySlug: WaySlug) {
  const way = getWay(waySlug);
  if (!way) return [];
  return way.productSlugs
    .map((slug) => getProduct(slug))
    .filter((product): product is MoodliaProduct => Boolean(product));
}

export function getRelatedProducts(product: MoodliaProduct) {
  return getWayProducts(product.waySlug).filter((candidate) => candidate.slug !== product.slug);
}
