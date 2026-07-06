"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { VERSE_ARABIC, VERSE_TRANSLATION } from "@/lib/verse";
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

/**
 * Grantmaking — cream ground, ink text. A centred headline crowns three
 * botanical illustrations that share one root system (image-3, transparent).
 * Each grant category sits to the upper-right of its plant, faint vertical
 * hairlines dividing the three. Below, the full Quran 2:110 verse resolves
 * centred: large bronze Arabic (right-to-left mask-wipe), then the italic
 * translation — matching the crop's order.
 */
export function Grantmaking() {
  const verseRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = verseRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="grantmaking" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.headline} data-reveal>
          Where the endowment puts
          <br className={styles.headlineBreak} /> its roots to work
        </h2>

        {/* three botanicals sharing one root system, with the categories
            overlaid in a flex row — one per plant-third.
            No reveal/will-change on this wrapper: it would isolate a stacking
            context and defeat the image's multiply blend onto the cream. */}
        <div className={styles.plot}>
          <Image
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
                className={styles.group}
                data-reveal
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <h3 className={styles.groupName}>{category.name}</h3>
                <p className={styles.groupBody}>{category.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quran 2:110 — bronze Arabic resolves R→L, then the italic
            translation (crop order), centred and tucked into the fading roots */}
        <div
          ref={verseRef}
          className={`verse verse--legacy${drawn ? " is-drawn" : ""} ${styles.verse}`}
        >
          <p className={`verse__arabic ${styles.arabic}`} lang="ar" dir="rtl">
            {VERSE_ARABIC}
          </p>
          <div className="verse__gloss">
            <p className={`verse__translation ${styles.translation}`}>
              {VERSE_TRANSLATION}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
