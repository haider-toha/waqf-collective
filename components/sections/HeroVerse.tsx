"use client";

import { useEffect, useState } from "react";
import { VERSE_ARABIC, VERSE_REFERENCE, VERSE_TRANSLATION } from "@/lib/verse";
import styles from "./Hero.module.css";

/**
 * Qur'an 2:110 as a small, muted margin-note above the hero headline — the
 * spiritual anchor of the page, echoed larger at the Grantmaking close. The
 * Arabic wipes in right-to-left on mount (the reed laying ink); the gloss
 * (translation + reference) fades in after. Reuses the global .verse /
 * .verse--hero styling; reduced motion shows it at rest with no wipe.
 */
export function HeroVerse() {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setDrawn(true);
      return;
    }
    const id = window.setTimeout(() => setDrawn(true), 350);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div
      className={`verse verse--hero ${styles.heroVerse}${drawn ? " is-drawn" : ""}`}
    >
      <p className="verse__arabic" lang="ar" dir="rtl">
        {VERSE_ARABIC}
      </p>
      <div className="verse__gloss">
        <p className="verse__translation">{VERSE_TRANSLATION}</p>
        <p className="verse__meta">{VERSE_REFERENCE}</p>
      </div>
    </div>
  );
}
