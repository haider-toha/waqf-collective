import styles from "./Colophon.module.css";

/**
 * Colophon — the manuscript's last line. No dividers, no Arabic, no logo grid.
 * Just the wordmark set huge in Geist, centered, bronze —
 * and it doubles as the return-to-top link: hover warms it to cream. A single
 * tiny meta line below carries the coordinates and copyright. That's it.
 */
export function Colophon() {
  return (
    <footer className={styles.colophon} data-reveal>
      <a
        href="#hero"
        className={styles.wordmark}
        aria-label="Waqf Collective — return to the top"
      >
        Waqf Collective.
      </a>

      <p className={styles.meta}>
        <span>Est. 1446H</span>
        <span aria-hidden className={styles.dot}>
          ·
        </span>
        <span>Registered Non-Profit Endowment</span>
        <span aria-hidden className={styles.dot}>
          ·
        </span>
        <span>© 2026 Collective Waqf</span>
      </p>
    </footer>
  );
}
