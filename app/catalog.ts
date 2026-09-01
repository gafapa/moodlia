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
  startGuide: {
    install: string[];
    firstUse: string[];
    adminNote: string;
  };
  sourceUrl: string;
  sourceLabel: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
}

export const ways: MoodliaWay[] = [
  {
    slug: "ai-integration",
    number: "1",
    title: "Turn ideas into Moodle learning",
    shortTitle: "Plan with AI",
    description: "Shape a course, activity, or improvement with AI support—then decide what reaches Moodle.",
    introduction:
      "Practical ways to turn a teaching idea into Moodle content, with your Moodle site, permissions, and professional judgement staying in charge.",
    image: "/moodlia-ai-companion-v2.jpg",
    imageAlt: "An educator planning a course with lesson notes and a laptop in a bright learning space",
    imageCaption: "AI that supports the way you already teach",
    outcomes: [
      "Prepare and improve Moodle content without starting every task from a blank page.",
      "Use the AI assistant or workflow that fits your school and your way of working.",
      "Review each proposed change before it becomes part of a live course.",
    ],
    productSlugs: ["moodle-plugin", "cli", "moodle-core-cli", "skills"],
  },
  {
    slug: "teaching-tools",
    number: "2",
    title: "Spend more time teaching",
    shortTitle: "Teach with ease",
    description: "Prepare rubrics, review work, and give useful feedback with less repetitive effort.",
    introduction:
      "Focused tools that help with the parts of Moodle teaching that take the most time, while every teaching and grading decision remains yours.",
    image: "/moodlia-teaching-flow-v2.jpg",
    imageAlt: "An educator calmly reviewing student work and feedback cards",
    imageCaption: "More time for thoughtful teaching",
    outcomes: [
      "Bring a complete rubric into Moodle instead of entering every level by hand.",
      "Use feedback suggestions as a starting point, then approve only what you mean.",
      "Move a course backup to an older Moodle site without sending it to a server.",
    ],
    productSlugs: ["rubrics", "corrector", "backup-converter", "chrome-extensions"],
  },
  {
    slug: "learning-insights",
    number: "3",
    title: "Know where to help next",
    shortTitle: "See what matters",
    description: "Turn course activity into clear priorities so support arrives at the right time.",
    introduction:
      "Clear course views that bring together activity, deadlines, participation, and progress, so the next helpful conversation is easier to spot.",
    image: "/moodlia-learning-clarity-v2.jpg",
    imageAlt: "An educator reviewing a simple learning overview and three priority markers",
    imageCaption: "Clarity for the next helpful decision",
    outcomes: [
      "See the courses, deadlines, and resources that need attention in one place.",
      "Notice participation and progress patterns worth following up with care.",
      "Choose the simple overview or a deeper analysis when you need it.",
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
    startGuide: {
      install: [
        "Ask the person who manages your Moodle site to install this plugin once for the site.",
        "Ask them to create a separate, limited MoodlIA service account and token for the work you need.",
        "Keep the Moodle address and token private; do not share an administrator password.",
      ],
      firstUse: [
        "Start with a small task in a copied or test course.",
        "Use it through a companion tool such as MoodlIA CLI or an approved AI assistant.",
        "Review each proposed Moodle change before confirming it.",
      ],
      adminNote: "This is the foundation installed by a Moodle administrator. Teachers normally use it through another MoodlIA tool.",
    },
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
    startGuide: {
      install: [
        "Ask a colleague who is comfortable with command-line tools to install MoodlIA CLI on the computer you will use.",
        "Give them the Moodle address and a dedicated MoodlIA REST token supplied by your Moodle administrator.",
        "Keep that token private and use a test course for your first connection.",
      ],
      firstUse: [
        "Open the command tool and check that it can read your Moodle site.",
        "Try one small, reversible task, such as listing a course or creating a draft item.",
        "Check the result in Moodle before repeating the workflow.",
      ],
      adminNote: "This is a terminal tool. You do not need to learn it alone: your Moodle or IT colleague can complete the one-time setup with you.",
    },
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
    startGuide: {
      install: [
        "Ask your Moodle administrator to enable the standard REST services needed for your task.",
        "Ask a colleague who uses command-line tools to install Moodle Core CLI on your computer.",
        "Use a dedicated token with only the Moodle functions you need.",
      ],
      firstUse: [
        "First confirm that the tool can read your Moodle site.",
        "Try a small task in a test course before changing a live course.",
        "Review the Moodle result after every new workflow.",
      ],
      adminNote: "This option is useful when your Moodle site cannot install the MoodlIA plugin. It still needs a Moodle administrator to prepare access safely.",
    },
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
    startGuide: {
      install: [
        "Choose an AI workspace that can use reusable skills, such as Codex.",
        "Ask the person who manages that workspace to add the MoodlIA Skills collection.",
        "Connect the workspace to Moodle only through an approved MoodlIA or Moodle Core setup.",
      ],
      firstUse: [
        "Tell the assistant what you want to prepare in plain language.",
        "Start with a single page, section, or activity rather than a whole course.",
        "Read the proposed content and approve it before it is published in Moodle.",
      ],
      adminNote: "Skills guide an AI assistant; they do not give it access on their own. Moodle access remains controlled by the connection you choose.",
    },
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
    startGuide: {
      install: [
        "Use Chrome or another Chromium-based browser.",
        "Ask a colleague to add the MoodlIA Rubrics extension to the browser profile you use for Moodle.",
        "Prepare your rubric in the simple CSV template before opening Moodle.",
      ],
      firstUse: [
        "Open the rubric editing page in Moodle.",
        "Choose your CSV file and let the extension fill in the draft rubric.",
        "Read and adjust the criteria in Moodle before saving the rubric.",
      ],
      adminNote: "The extension works inside the browser and does not replace Moodle's rubric editor. You remain in control of the final rubric.",
    },
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
      "Google Chrome 116 or later",
      "Access to an HTTPS Moodle assignment grading page",
      "A local Ollama service or an OpenAI-compatible provider approved by your school or team",
    ],
    startGuide: {
      install: [
        "Install MoodlIA Corrector from the Chrome Web Store in your own Chrome profile.",
        "Open the extension options and choose local Ollama or the OpenAI-compatible provider approved by your school or team.",
        "Open Moodle normally with your own teacher account.",
      ],
      firstUse: [
        "Open one assignment submission in Moodle's grading page.",
        "Ask for a suggestion and read it alongside the student's work and your rubric.",
        "Only apply the parts you agree with, then save the grade in Moodle yourself.",
      ],
      adminNote: "Corrector suggests feedback; it does not make grading decisions for you. Nothing is applied until you approve it.",
    },
    sourceUrl: "https://github.com/gafapa/moodlia-corrector",
    sourceLabel: "View MoodlIA Corrector on GitHub",
  },
  {
    slug: "backup-converter",
    name: "MoodlIA Backup Converter",
    waySlug: "teaching-tools",
    kind: "Browser application",
    status: "Open-source project",
    description: "Adapts newer Moodle backups for selected older releases without uploading them.",
    introduction:
      "A local-first migration workbench for teachers and Moodle coordinators who need to reuse course material on an older site. It inspects a local .mbz file, explains compatibility risks, asks before removing unsupported activities, and prepares a converted backup entirely in the browser.",
    highlights: [
      "Offers nine explicit target branches from Moodle 5.1 to 3.11, with new profiles clearly marked experimental",
      "Keeps the source backup in the browser and never uploads it",
      "Downloads both the converted .mbz file and an auditable JSON report",
    ],
    bestFor: [
      "Teachers moving courses between Moodle sites on different releases",
      "Moodle coordinators preparing a working copy for a legacy site",
      "Checking known incompatibilities before attempting a restore",
    ],
    requirements: [
      "A modern browser with enough memory for the expanded backup",
      "A local Moodle .mbz backup no larger than 768 MB",
      "A test course on the destination Moodle site for the first restore",
    ],
    startGuide: {
      install: [
        "Open the static Backup Converter address provided by your school or team; there is nothing to install and no account to create.",
        "Keep the original .mbz backup unchanged and work with a copy.",
        "For a large backup, close other memory-intensive browser tabs before starting.",
      ],
      firstUse: [
        "Choose the local .mbz backup and one of the nine Moodle target branches.",
        "Read every blocker and approve removal only when you understand which activities will be omitted.",
        "Download the converted backup and JSON report, then restore first into an empty test course.",
      ],
      adminNote: "Conversion is conservative and auditable, but it cannot guarantee that every Moodle plugin or newer question-bank structure will restore on an older site. Always test the result before relying on it.",
    },
    sourceUrl: "https://github.com/gafapa/moodlia-backup-converter",
    sourceLabel: "View Backup Converter on GitHub",
    secondaryUrl: "/tools/backup-converter/",
    secondaryLabel: "Open Backup Converter",
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
    startGuide: {
      install: [
        "Choose the one browser tool that matches your task: Rubrics for setup or Corrector for feedback.",
        "Use Chrome or another supported Chromium-based browser.",
        "Ask a colleague to add the chosen extension to your browser profile.",
      ],
      firstUse: [
        "Open the Moodle page where you normally prepare or grade work.",
        "Use the extension for one small task first.",
        "Check the result in Moodle before saving or applying it.",
      ],
      adminNote: "Each extension stays focused on one Moodle task. You can ask us which one fits your workflow before installing anything.",
    },
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
    startGuide: {
      install: [
        "Ask your Moodle administrator to prepare a REST token with course and calendar access.",
        "Open the dashboard address provided by your school or team in a modern browser.",
        "Enter the Moodle address and token on your own device; the dashboard keeps its settings locally.",
      ],
      firstUse: [
        "Check that your courses and deadlines appear correctly.",
        "Open one course and use its direct Moodle links as you normally would.",
        "Make the dashboard part of a short daily or weekly check-in.",
      ],
      adminNote: "The dashboard connects from your browser directly to Moodle. Your Moodle site must allow that connection before it can synchronise.",
    },
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
    startGuide: {
      install: [
        "Ask your Moodle administrator for a suitable REST token.",
        "Open the Analyzer Web address provided by your school or team in a modern browser.",
        "If the connection is blocked, ask a colleague to add the optional browser bridge.",
      ],
      firstUse: [
        "Connect to one course and wait for the analysis to finish.",
        "Start with the course overview and the suggested priorities.",
        "Open a student view only when you are ready to decide on a helpful follow-up.",
      ],
      adminNote: "Analyzer Web is for finding questions worth looking at, not for making automatic decisions about students.",
    },
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
    startGuide: {
      install: [
        "Choose the Windows or Apple Silicon Mac version that matches your computer.",
        "Download the approved desktop build or ask your school or team to install it for you.",
        "Ask your Moodle administrator for the connection method approved by your site.",
      ],
      firstUse: [
        "Open the app and connect to Moodle for the current session.",
        "Choose one course and begin with its overview rather than individual student details.",
        "Use the analysis to guide a conversation or follow-up, then return to Moodle for the next action.",
      ],
      adminNote: "The desktop app keeps passwords only in memory for the active session. Use the connection method your Moodle site approves.",
    },
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
