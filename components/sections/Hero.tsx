import { PledgeCTA } from "@/components/PledgeCTA";
import { HeroSapling } from "./HeroSapling";
import { HeroVerse } from "./HeroVerse";
import styles from "./Hero.module.css";

/**
 * The cream hero. A stipple sapling anchors the right and bleeds off the bottom
 * (its soil mound runs past the viewport edge); the promise sits left with the
 * one action. The global nav renders above; ~6rem is left clear at the top.
 * The sapling rests as a pixelated mosaic and comes into focus under a spotlight
 * that trails the pointer — see {@link HeroSapling}.
 */
export function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      {/* sapling — pixelated mosaic at rest, crisp under the pointer spotlight */}
      <HeroSapling />

      {/* verse — right-side anchor beside the sapling crown */}
      <HeroVerse />

      {/* left column — promise + pledge */}
      <div className={styles.content}>
        <h1 className={styles.headline}>
          Plant a tree under whose shade you may never sit in.
        </h1>
        <p className={styles.body}>
          Join a community of founders committing to a generational vision. The
          pledge is simple to make, profound in its meaning, and transformative
          in its impact.
        </p>
        <div className={styles.ctaRow}>
          <PledgeCTA solid href="#close">
            Make a Pledge
          </PledgeCTA>
        </div>
      </div>
    </section>
  );
}
