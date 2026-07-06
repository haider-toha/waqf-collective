"use client";

import { useEffect, useState } from "react";
import styles from "./SiteHeader.module.css";
import { Wordmark } from "./Wordmark";

const NAV = [
  ["The Pledge", "#pledge-works"],
  ["Endowment Model", "#mission"],
  ["For Founders", "#grantmaking"],
  ["Manifesto", "#close"],
] as const;

/**
 * Fixed page chrome over the cream hero: wordmark left, pledge CTA right.
 * Desktop keeps the hero uncluttered — section links live in the mobile menu
 * only. Below 900px the hamburger opens a full-screen nav.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Lock the scroll and allow Escape to close while the menu is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={styles.header}>
      <a href="#hero" className={styles.brand} aria-label="Waqf Collective, home">
        <Wordmark className={styles.mark} />
        <span className={styles.brandText}>
          <span>Waqf</span>
          <span>Collective</span>
        </span>
      </a>

      <a href="#close" className={`cta ${styles.headerCta}`}>
        <span className="cta__fill" aria-hidden />
        <span>Make a Pledge</span>
        <span className="cta__arrow" aria-hidden>
          &#8594;
        </span>
      </a>

      <button
        type="button"
        className={styles.burger}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span data-open={open} />
        <span data-open={open} />
      </button>

      <div className={styles.menu} data-open={open} aria-hidden={!open}>
        <nav className={styles.menuNav} aria-label="Menu">
          {NAV.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className={styles.menuLink}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          href="#close"
          className={`cta cta--solid ${styles.menuCta}`}
          onClick={() => setOpen(false)}
        >
          <span className="cta__fill" aria-hidden />
          <span>Make a Pledge</span>
          <span className="cta__arrow" aria-hidden>
            &#8594;
          </span>
        </a>
      </div>
    </header>
  );
}
