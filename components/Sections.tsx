import { Hero } from "./sections/Hero";
import { PledgeWorks } from "./sections/PledgeWorks";
import { Mission } from "./sections/Mission";
import { Grantmaking } from "./sections/Grantmaking";
import { Close } from "./sections/Close";
import { Colophon } from "./Colophon";

/**
 * The single-page narrative, in scroll order:
 *   Hero (cream) → How the pledge works (charcoal) → Mission (charcoal) →
 *   Grantmaking (cream) → Close (cream footer) → Colophon (charcoal end-card).
 * Each section owns its own markup, CSS module, responsive behaviour and motion.
 */
export function Sections() {
  return (
    <>
      <Hero />
      <PledgeWorks />
      <Mission />
      <Grantmaking />
      <Close />
      <Colophon />
    </>
  );
}
