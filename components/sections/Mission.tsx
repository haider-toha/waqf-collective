import Image from "next/image";
import { PledgeCTA } from "@/components/PledgeCTA";
import styles from "./Mission.module.css";

/** The three closing figures — display serif numerals, never monospace. */
const STATS = [
  { figure: "∞", label: "Generations" },
  { figure: "100%", label: "Mission aligned" },
  { figure: "1%", label: "Your pledge" },
];

/**
 * Mission — charcoal, two columns. Left: the pull-quote, the outlined manifesto
 * CTA, a quiet trust line and the three figures. Right: the stone arch, bled
 * full-height to the top/bottom/right edges. Solemn: only the quote and figures
 * reveal on scroll, the figures on a small stagger.
 */
export function Mission() {
  return (
    <section id="mission" className={styles.section}>
      <div className={styles.textCol}>
        <div className={styles.lead}>
          <p className={styles.quote} data-reveal>
            An institution dedicated to translating the success of modern
            founders into generation-spanning impact through the Islamic
            endowment tradition.
          </p>
          <p
            className={styles.context}
            data-reveal
            style={{ transitionDelay: "80ms" }}
          >
            Historically, waqfs were funded with land and real estate. Today,
            the most significant wealth is created in the technology sector.
          </p>
        </div>

        <div className={styles.ctaRow}>
          <PledgeCTA href="#close">Read the Manifesto</PledgeCTA>
        </div>

        <div className={styles.foot}>
          <p className={styles.tagline}>
            Built on trust.
            <br />
            Structured for eternity.
          </p>

          <div className={styles.stats}>
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={styles.stat}
                data-reveal
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className={styles.figure}>{s.figure}</span>
                <span className={`${styles.label} u-label`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.media}>
        <Image
          src="/opt/image-4.webp"
          alt=""
          fill
          sizes="(max-width:900px) 100vw, 45vw"
          style={{ objectFit: "cover", objectPosition: "88% center" }}
        />
      </div>
    </section>
  );
}
