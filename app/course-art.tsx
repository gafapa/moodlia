import type { CinematicCopy } from "./cinematic-copy";
import { EditorialArt, type ArtKind } from "./editorial-art";

const chapterArt: Record<string, ArtKind> = { idea: "teaching", create: "teaching", rubric: "assessment", feedback: "assessment", follow: "teaching", reuse: "reuse" };

/** Editorial teaching illustrations; never presented as product screenshots. */
export function CourseArt({ kind, copy }: { kind: string; copy: CinematicCopy }) {
  return <div className={`illustrated-chapter illustrated-${kind}`}><EditorialArt kind={chapterArt[kind] ?? "teaching"} eager={kind === "idea"} />{kind !== "idea" ? <span className="illustration-subject">{kind === "create" ? copy.lesson : kind === "rubric" ? copy.rubric.join(" / ") : kind === "feedback" ? copy.review : kind === "reuse" ? copy.reuseLabels.join(" / ") : copy.followBottom}</span> : null}</div>;
}
