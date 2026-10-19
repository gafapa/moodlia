import type { Locale } from "./content";
import { appPath } from "./i18n";
import { ArrowIcon } from "./icons";

const networkCopy = {
  en: { label: "Explore ways to work with Moodle", center: "Your Moodle", note: "Different ways to start. Each tool has its own setup.", rubrics: "Import rubrics", analyze: "Connect your AI", convert: "Adapt backups", connect: "Review work", sync: "Sync courses", core: "Where the work happens" },
  es: { label: "Explora formas de trabajar con Moodle", center: "Tu Moodle", note: "Distintas formas de empezar. Cada herramienta tiene su configuración.", rubrics: "Importar rúbricas", analyze: "Conectar tu IA", convert: "Adaptar copias", connect: "Revisar tareas", sync: "Sincronizar cursos", core: "Donde ocurre el trabajo" },
};

/** The diagram is a navigation map, not a representation of live connections. */
export function ToolNetwork({ locale }: { locale: Locale }) {
  const copy = networkCopy[locale];
  const nodes = [
    { slug: "rubrics", label: copy.rubrics, name: "Rubrics", position: "rubrics" },
    { slug: "moodle-plugin", label: copy.analyze, name: "MoodlIA", position: "analyze" },
    { slug: "backup-converter", label: copy.convert, name: "Converter", position: "convert" },
    { slug: "corrector", label: copy.connect, name: "Corrector", position: "connect" },
    { slug: "sync", label: copy.sync, name: "Sync", position: "sync" },
  ] as const;

  return (
    <nav className="tool-network" aria-label={copy.label}>
      <svg className="network-lines" viewBox="0 0 600 520" aria-hidden="true" fill="none">
        <path className="network-frame" d="M148 88 464 130 490 374 278 452 86 294Z" />
        <path className="network-strut" d="M148 88 490 374M464 130 278 452M86 294 464 130" />
        <g className="network-cords">
          <path d="M300 260 148 88M300 260 464 130M300 260 490 374M300 260 278 452M300 260 86 294" />
        </g>
        <g className="network-joints">
          <circle cx="148" cy="88" r="5" /><circle cx="464" cy="130" r="5" />
          <circle cx="490" cy="374" r="5" /><circle cx="278" cy="452" r="5" /><circle cx="86" cy="294" r="5" />
        </g>
      </svg>
      <div className="network-center"><span className="center-symbol" aria-hidden="true">m</span><strong>{copy.center}</strong><span>{copy.core}</span></div>
      {nodes.map((node) => (
        <a className={`network-node node-${node.position}`} href={appPath(node.slug, locale)} key={node.slug}>
          <span>{node.name}</span><strong>{node.label}</strong>
          <ArrowIcon />
        </a>
      ))}
      <p className="network-caption">{copy.note}</p>
    </nav>
  );
}
