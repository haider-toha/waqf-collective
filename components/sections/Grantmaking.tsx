"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useScrollProgress, smoothstep } from "@/lib/useScrollProgress";
import styles from "./Grantmaking.module.css";

/**
 * The three grant categories. Per the reference crop the names are set in the
 * display serif, Title Case — not the tracked-caps `u-label` used elsewhere.
 */
const CATEGORIES = [
  {
    name: "Ethical Tech",
    body: "Funding work to align technology development with ethical frameworks.",
  },
  {
    name: "Economic Empowerment",
    body: "Capital for underfunded communities in developing economies.",
  },
  {
    name: "Development",
    body: "Grants for neglected areas of development that secure long-term interests.",
  },
];

// Per-plant reveal windows across the pinned scroll progress p∈[0,1]. Each plant
// (and its category) eases in over its window; the windows are staggered with
// overlap so one plant is settling as the next begins. Because the mask windows
// also overlap in the troughs (mask-composite: add), the shared root system
// stays continuous the whole way. All three finish before p=1 so the full
// composition holds a beat before the section ends.
const REVEAL: ReadonlyArray<readonly [number, number]> = [
  [0.04, 0.32],
  [0.3, 0.6],
  [0.56, 0.86],
];

/**
 * Grantmaking — cream ground, ink text. A centred headline crowns three
 * botanical illustrations that share one root system (image-3). As the section
 * pins and scrubs, the plants reveal ONE AT A TIME: each is a soft-feathered
 * window in the image's mask whose alpha (--m1..--m3) the scroll ramps 0→1, and
 * each grant category fades/rises in with its plant. Adjacent windows overlap in
 * the troughs (mask-composite: add) so the shared roots read continuous. Mobile /
 * reduced motion drop the pin (full plants + roots, stacked categories).
 *
 * The image stays fully opaque — the reveal is the mask, never element opacity —
 * so its `darken` blend keeps clamping the webp's near-white checker onto the
 * cream while the darker linework survives. (Animating opacity would isolate the
 * layer and break the blend.)
 */
export function Grantmaking() {
  const trackRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const groupRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [enabled, setEnabled] = useState(false);

  // Scrub only on wide viewports without reduced motion; narrow screens keep a
  // static, reflow-safe stack and reduced motion shows everything at rest. The
  // gate is 1081px (not 769px like PledgeWorks) because the categories are
  // absolutely positioned over the plants — below 1080px they stack instead.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1081px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(wide.matches && !reduce.matches);
    update();
    wide.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  useScrollProgress(
    trackRef,
    (p) => {
      const img = imgRef.current;
      for (let i = 0; i < REVEAL.length; i++) {
        const [a, b] = REVEAL[i];
        const t = smoothstep(a, b, p);
        // drive this plant's mask-window alpha (the img's own custom prop)
        if (img) img.style.setProperty(`--m${i + 1}`, t.toFixed(3));
        const group = groupRefs.current[i];
        if (group) {
          group.style.opacity = t.toFixed(3);
          group.style.transform = `translateY(${((1 - t) * 12).toFixed(2)}px)`;
        }
      }
    },
    enabled,
  );

  return (
    <section id="grantmaking" className={styles.section}>
      {/* Tall scrub track; the sticky pin holds the frame while it scrubs. */}
      <div className={styles.scrubTrack} ref={trackRef}>
        <div className={styles.pin}>
          <h2 className={styles.headline} data-reveal>
            Where the endowment puts
            <br className={styles.headlineBreak} /> its roots to work
          </h2>

          {/* three botanicals sharing one root system, with the categories
              overlaid upper-right of each plant. No reveal/will-change on this
              wrapper: it would isolate a stacking context and defeat the image's
              darken blend onto the cream painted on the pin. */}
          <div className={styles.sequence}>
            <div className={styles.plot}>
              <Image
                ref={imgRef}
                className={styles.image}
                src="/opt/image-3.webp"
                alt=""
                width={1088}
                height={608}
                sizes="(max-width: 1080px) 92vw, 1100px"
              />

              <div className={styles.overlay}>
                {CATEGORIES.map((category, i) => (
                  <div
                    key={category.name}
                    ref={(el) => {
                      groupRefs.current[i] = el;
                    }}
                    className={styles.group}
                  >
                    <h3 className={styles.groupName}>{category.name}</h3>
                    <p className={styles.groupBody}>{category.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
