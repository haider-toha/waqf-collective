import Image from "next/image";
import styles from "./Close.module.css";

/**
 * Close — cream footer. Two text columns (serif lede + body paragraph) held
 * left-of-centre, with the ink-wash mountains (image-5) bleeding off the right
 * edge behind them.
 *
 * No client JS: reveals are driven by the global [data-reveal] observer.
 * The mountains are decorative (alt="", aria-hidden wrapper).
 */
export function Close() {
  return (
    <section id="close" className={styles.section}>
      {/* ---- cream footer ---------------------------------------------- */}
      <div className={styles.footer}>
        <div className={styles.mountains} aria-hidden>
          <Image
            src="/opt/image-5.webp"
            alt=""
            width={1088}
            height={608}
            sizes="(max-width: 720px) 100vw, 62vw"
            className={styles.mountainImg}
          />
        </div>

        <div className={styles.footerContent}>
          <div className={styles.grid}>
            <p className={styles.lede} data-reveal>
              Historically, waqfs were funded with land and real estate. Today,
              the most significant wealth is created in the technology sector.
            </p>
            <p className={styles.body} data-reveal>
              Collective Waqf revives this asset class for a new purpose. We
              provide the structural, legal, and operational framework for
              modern founders to pledge equity and make contributions, creating
              a permanent engine for future innovation with taqwa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
