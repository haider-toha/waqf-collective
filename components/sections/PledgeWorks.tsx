"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useScrollProgress, smoothstep } from "@/lib/useScrollProgress";
import styles from "./PledgeWorks.module.css";

/**
 * How the pledge works (charcoal, bone text). The endowment model as one golden
 * line whose five growth stages (image-2) reveal ONE AT A TIME as you scroll: the
 * section pins for a few screens and each scroll materialises the next stage —
 * seed → sprout → sapling → young tree → full tree. Each stage is a soft-feathered
 * window in the image's mask; scroll ramps its alpha up, and because adjacent
 * windows overlap in the troughs (mask-composite: add) their edges meet so the
 * golden line reads continuous. The four labels rise in behind their stems. Mobile
 * drops the pin (full line, stacked labels); reduced motion shows everything.
 *
 * The image stays fully opaque — the reveal is the mask, never element opacity —
 * so its `lighten` blend keeps dropping the webp's black ground onto the charcoal.
 * (Animating opacity would isolate the layer and break the blend.)
 */

const STAGES = [
  {
    title: "The Pledge",
    body: "You pledge equity now or as a future commitment.",
  },
  {
    title: "The Realisation",
    body: "At a liquidity event, the proceeds of the pledged equity are transferred to the Collective Waqf.",
  },
  {
    title: "The Endowment",
    body: "A perpetual endowment is created and governed in accordance with Islamic principles.",
  },
  {
    title: "Grantmaking",
    body: "Capital is distributed ethically to initiatives that align with our mission and values.",
  },
  {
    title: "A legacy of light.\nFor generations\nto come.",
    body: "",
  },
] as const;

// Per-stage reveal windows across the pinned scroll progress p∈[0,1]. Each stage
// eases in (smoothstep) over its window; windows are staggered with overlap so a
// stage is settling as the next begins — their feathered edges connect. The last
// stage finishes before p=1 so the full composition holds a beat before release.
const REVEAL: ReadonlyArray<readonly [number, number]> = [
  [0.02, 0.2],
  [0.18, 0.38],
  [0.36, 0.56],
  [0.54, 0.74],
  [0.72, 0.92],
];

export function PledgeWorks() {
  const wrapRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const colRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [enabled, setEnabled] = useState(false);

  // Scrub only on wide viewports without reduced motion; phones keep a static,
  // reflow-safe stack and reduced motion shows everything at rest.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 769px)");
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
    wrapRef,
    (p) => {
      const img = imgRef.current;
      for (let i = 0; i < REVEAL.length; i++) {
        const [a, b] = REVEAL[i];
        const t = smoothstep(a, b, p);
        // drive this stage's mask-window alpha (the img's own custom prop)
        if (img) img.style.setProperty(`--m${i + 1}`, t.toFixed(3));
        const col = colRefs.current[i];
        if (col) {
          col.style.opacity = t.toFixed(3);
          col.style.transform = `translateY(${((1 - t) * 12).toFixed(2)}px)`;
        }
      }
    },
    enabled,
  );

  return (
    <section id="pledge-works" ref={wrapRef} className={styles.section}>
      <div className={styles.pin}>
        <div className={styles.head}>
          <h2 className={styles.title}>How the pledge works</h2>
        </div>

        <div className={styles.sequence}>
          <div className={styles.inner}>
            {/* One golden line; its five stage-windows ramp in as you scroll. */}
            <div className={styles.figure}>
              <div className={styles.figureFade}>
                <Image
                  ref={imgRef}
                  src="/opt/image-2.webp"
                  alt=""
                  width={1088}
                  height={608}
                  className={styles.figureImg}
                  sizes="(max-width: 768px) 820px, 100vw"
                />
              </div>
            </div>

            <ol className={styles.labels}>
              {STAGES.map((s, i) => (
                <li
                  key={s.title}
                  ref={(el) => {
                    colRefs.current[i] = el;
                  }}
                  className={styles.col}
                >
                  <h3
                    className={styles.colTitle}
                    style={
                      s.title.includes("\n")
                        ? { whiteSpace: "pre-line" }
                        : undefined
                    }
                  >
                    {s.title}
                  </h3>
                  {s.body && <p className={styles.colBody}>{s.body}</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
