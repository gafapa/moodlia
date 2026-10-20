/* eslint-disable @next/next/no-img-element -- Locally optimized static artwork with explicit dimensions. */
import type { AppSlug, Locale } from "./content";

export type ArtKind = "teaching" | "assessment" | "reuse";
const artwork = { teaching: "teaching-workshop", assessment: "assessment-workshop", reuse: "course-reuse" };

export function artForTool(slug: AppSlug): ArtKind {
  if (["corrector", "rubrics"].includes(slug)) return "assessment";
  if (["sync", "backup-converter", "edx-converter"].includes(slug)) return "reuse";
  return "teaching";
}

export function EditorialArt({ kind, className = "", eager = false, caption }: { kind: ArtKind; className?: string; eager?: boolean; caption?: string }) {
  return <figure className={`editorial-art art-${kind} ${className}`}><img src={`/images/editorial/${artwork[kind]}.jpg`} width={1536} height={1024} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />{caption ? <figcaption>{caption}</figcaption> : null}</figure>;
}

const journeys: Record<AppSlug, { en: string[]; es: string[] }> = {
  portable: { en: ["Install on your computer", "Create your course", "Export to Moodle"], es: ["Instalar en tu ordenador", "Crear tu curso", "Exportar a Moodle"] },
  "moodle-plugin": { en: ["Authorized access", "Compatible assistant", "Work in Moodle"], es: ["Acceso autorizado", "Asistente compatible", "Trabajo en Moodle"] },
  cli: { en: ["Account and token", "Explicit command", "Review the result"], es: ["Cuenta y token", "Comando explícito", "Revisar el resultado"] },
  "moodle-core-cli": { en: ["Enabled services", "Core command", "Verify in Moodle"], es: ["Servicios habilitados", "Comando Core", "Verificar en Moodle"] },
  rubrics: { en: ["CSV or Excel", "Import the criteria", "Review and save"], es: ["CSV o Excel", "Importar los criterios", "Revisar y guardar"] },
  corrector: { en: ["Submission and criteria", "AI proposal", "Teacher decision"], es: ["Entrega y criterios", "Propuesta de IA", "Decisión docente"] },
  "backup-converter": { en: ["Moodle backup", "Supported target profile", "Test the restore"], es: ["Copia de Moodle", "Perfil de destino admitido", "Probar la restauración"] },
  "edx-converter": { en: ["Open edX archive", "Supported OLX blocks", "Moodle backup"], es: ["Archivo de Open edX", "Bloques OLX admitidos", "Copia para Moodle"] },
  sync: { en: ["Source content", "Plan and approval", "Apply and verify"], es: ["Contenido de origen", "Plan y aprobación", "Aplicar y verificar"] },
  "teacher-dashboard": { en: ["Authorized connection", "Courses and deadlines", "Open in Moodle"], es: ["Conexión autorizada", "Cursos y plazos", "Abrir en Moodle"] },
  "analyzer-web": { en: ["Activity and grades", "Course signals", "Teacher interpretation"], es: ["Actividad y notas", "Señales del curso", "Interpretación docente"] },
  skills: { en: ["Learning objective", "Accessible HTML", "Review the resource"], es: ["Objetivo didáctico", "HTML accesible", "Revisar el recurso"] },
};

export function ToolJourney({ slug, locale }: { slug: AppSlug; locale: Locale }) {
  return <div className="tool-journey" role="group" aria-label={locale === "es" ? "Recorrido de la herramienta" : "Tool workflow"}><ol>{journeys[slug][locale].map((label, index) => <li key={label}><span>{label}</span>{index < 2 ? <svg viewBox="0 0 64 24" aria-hidden="true"><path d="M0 12h58m-9-9 10 9-10 9" fill="none" stroke="currentColor" strokeWidth="2"/></svg> : null}</li>)}</ol></div>;
}
