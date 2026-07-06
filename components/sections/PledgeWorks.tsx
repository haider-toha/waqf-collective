"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./PledgeWorks.module.css";

/**
 * How the pledge works (charcoal, bone text). The endowment model as a single
 * golden line: five glowing growth stages (image-2) span the band, and the
 * first four carry labels aligned under their stems. On scroll-in the line
 * mask-wipes left→right and the four labels cascade in behind it. On mobile the
 * whole sequence (image + labels) becomes one horizontal-scroll strip. Reduced
 * motion fades.
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

export function PledgeWorks() {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reveal when the band scrolls into view. Under reduced motion the CSS swaps
    // the wipe/cascade for a plain fade, so this single trigger serves both — and
    // it keeps setState in a callback, never synchronously in the effect body.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect(); // once
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="pledge-works"
      ref={ref}
      className={styles.section}
      data-shown={shown ? "true" : undefined}
    >
      <div className={styles.head}>
        <h2 className={styles.title}>How the pledge works</h2>
      </div>

      {/* The endowment line — one horizontal band; a scroll strip on mobile. */}
      <div className={styles.sequence}>
        <div className={styles.inner}>
          <div className={styles.figure}>
            <Image
              src="/opt/image-2.webp"
              alt=""
              width={1088}
              height={608}
              className={styles.figureImg}
              sizes="(max-width: 768px) 820px, 100vw"
            />
          </div>
          <ol className={styles.labels}>
            {STAGES.map((s) => (
              <li key={s.title} className={styles.col}>
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
    </section>
  );
}
