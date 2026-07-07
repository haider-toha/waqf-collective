"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./SiteHeader.module.css";

/**
 * Fixed page chrome over the cream hero: logo left, pledge CTA right.
 * Desktop and mobile share the same minimal header — section links are not
 * surfaced from the chrome; the page is a single scroll narrative.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  // Give the header a cream backdrop only once it leaves the hero, so it stays
  // clean over the hero but legible over dark sections. setState to an unchanged
  // value is a no-op re-render, so this is cheap.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={styles.header} data-scrolled={scrolled}>
      <a
        href="#hero"
        className={styles.brand}
        aria-label="Waqf Collective, home"
      >
        <span className={styles.logoMark}>
          <Image
            src="/logos/main_logo.png"
            alt="Waqf Collective"
            fill
            className={styles.logo}
            priority
            sizes="(min-width: 900px) 110px, 90px"
          />
        </span>
      </a>

      <a href="#close" className={`cta ${styles.headerCta}`}>
        <span className="cta__fill" aria-hidden />
        <span>Make a Pledge</span>
        <span className="cta__arrow" aria-hidden>
          &#8594;
        </span>
      </a>
    </header>
  );
}
