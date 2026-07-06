"use client";

import { useEffect, useRef, useState } from "react";
import {
  VERSE_ARABIC,
  VERSE_CITATION,
  VERSE_TRANSLATION,
  VERSE_TRANSLITERATION,
} from "@/lib/verse";

type Props = {
  /** hero = compact margin note; legacy = large payoff with translation */
  variant?: "hero" | "legacy";
  showTranslation?: boolean;
  className?: string;
};

/**
 * Quran 2:110, quoted verbatim (strings extracted from the source, never
 * paraphrased; the em dash in the translation is revealed scripture). The
 * Arabic reveals right-to-left (clip-path, ~1100ms ease-out) the first time it
 * enters view, like a reed laying ink. Reduced motion falls back to a fade.
 */
export function VerseReveal({
  variant = "hero",
  showTranslation = false,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
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
    <div
      ref={ref}
      className={`verse verse--${variant}${drawn ? " is-drawn" : ""}${className ? ` ${className}` : ""}`}
    >
      <p className="verse__arabic" lang="ar" dir="rtl">
        {VERSE_ARABIC}
      </p>
      {showTranslation && (
        <div className="verse__gloss">
          <p className="verse__translation">{VERSE_TRANSLATION}</p>
          <p className="verse__meta">
            {VERSE_TRANSLITERATION} &middot; {VERSE_CITATION}
          </p>
        </div>
      )}
    </div>
  );
}
