"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { SiteHeader } from "./SiteHeader";
import { Sections } from "./Sections";

/**
 * The page shell. Lenis provides weighted smooth scrolling (kept from the
 * infrastructure); anchor clicks are routed through it. A single
 * IntersectionObserver drives every `[data-reveal]` element so sections get
 * scroll-in reveals with no per-section wiring. Everything degrades to a plain
 * native scroll + instant reveal under reduced motion.
 */
export function Experience() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- reveal-on-scroll (opacity/transform only) -------------------------
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (reduce) {
      revealTargets.forEach((el) => el.setAttribute("data-shown", "true"));
    }
    const io = reduce
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                e.target.setAttribute("data-shown", "true");
                io?.unobserve(e.target);
              }
            }
          },
          { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
        );
    if (io) revealTargets.forEach((el) => io.observe(el));

    // --- smooth scroll -----------------------------------------------------
    let lenis: Lenis | null = null;
    let raf = 0;
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      const loop = (time: number) => {
        lenis!.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    // Route in-page anchor links through Lenis (or native scroll).
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest?.('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href");
      if (!id || id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el as HTMLElement, { offset: 0 });
      else (el as HTMLElement).scrollIntoView({ behavior: "auto" });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      io?.disconnect();
      if (raf) cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main>
        <Sections />
      </main>
    </>
  );
}
