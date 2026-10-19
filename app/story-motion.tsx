"use client";

import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Enhance the server-rendered story; native scrolling remains the sole scroll owner. */
export function StoryMotion({ locale }: { locale: "en" | "es" }) {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = document.querySelector<HTMLElement>(".cinematic-home");
    if (!root) return;
    if (!enabled) {
      root.querySelector(".course-story")?.classList.add("is-rest");
      return () => root.querySelector(".course-story")?.classList.remove("is-rest");
    }
    let disposed = false;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({ desktop: "(min-width: 1000px) and (min-height: 740px)", motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions }) => {
        const scene = root.querySelector<HTMLElement>(".course-story");
        if (!scene) return;
        if (!conditions?.motion || !conditions?.desktop) {
          scene.classList.add("is-rest");
          return () => scene.classList.remove("is-rest");
        }
        const panels = gsap.utils.toArray<HTMLElement>(".story-panel", root);
        const stage = root.querySelector<HTMLElement>(".story-stage")!;
        const steps = gsap.utils.toArray<HTMLElement>(".story-progress span", root);
        scene.classList.add("is-live");
        const activate = (index: number) => {
          panels.forEach((panel, position) => {
            panel.inert = position !== index;
            if (position !== index) panel.setAttribute("aria-hidden", "true");
            else panel.removeAttribute("aria-hidden");
          });
          steps.forEach((step, position) => step.classList.toggle("is-current", position === index));
        };
        const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
          trigger: scene, start: "top top", end: () => `+=${window.innerHeight * 4.8}`, pin: stage, scrub: 0.35, invalidateOnRefresh: true,
        }});
        panels.forEach((panel, index) => {
          const art = panel.querySelector(".chapter-art");
          const pieces = panel.querySelectorAll(".chapter-art img, .chapter-art .illustration-subject");
          const text = panel.querySelectorAll(".chapter-copy > *");
          timeline.addLabel(panel.id, index);
          if (index > 0) {
            gsap.set(panel, { yPercent: 100, autoAlpha: 0 });
            timeline.set(panel, { autoAlpha: 1 }, index - 0.3);
            timeline.to(panel, { yPercent: 0, duration: 0.3 }, index - 0.3);
            timeline.set(panels[index - 1], { autoAlpha: 0 }, index);
          }
          timeline.fromTo(art, { y: 60, rotate: 4, scale: 0.88 }, { y: 0, rotate: 0, scale: 1, duration: 0.45 }, index);
          timeline.fromTo(text, { y: 28 }, { y: 0, stagger: 0.035, duration: 0.22 }, index);
          timeline.fromTo(pieces, { y: 35 }, { y: 0, stagger: 0.055, duration: 0.4 }, index + 0.05);
        });
        timeline.to({}, { duration: 0.35 });
        timeline.eventCallback("onUpdate", () => activate(Math.min(4, Math.floor(timeline.time()))));
        activate(0);
        return () => {
          scene.classList.remove("is-live");
          panels.forEach(panel => { panel.inert = false; panel.removeAttribute("aria-hidden"); });
        };
      });
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".poster-title > span", { y: 36, opacity: 0.7, duration: 0.8, stagger: 0.1, ease: "power3.out" });
        gsap.to(".poster-art .editorial-art", { y: -35, scrollTrigger: { trigger: ".poster-hero", start: "top top", end: "bottom top", scrub: true } });
        root.querySelectorAll("[data-enter]").forEach(element => {
          gsap.from(element.children, { y: 25, opacity: 0.4, stagger: 0.08, duration: 0.65, scrollTrigger: { trigger: element, start: "top 92%", once: true } });
        });
      });
    }, root);
    const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
    document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => { disposed = true; window.removeEventListener("load", refresh); media.revert(); context.revert(); };
  }, [enabled]);
  return <div className="story-motion-control"><button type="button" onClick={() => setEnabled(!enabled)} aria-pressed={!enabled}>{locale === "es" ? enabled ? "Leer sin movimiento" : "Activar el recorrido animado" : enabled ? "Read without motion" : "Enable the animated story"}</button></div>;
}
