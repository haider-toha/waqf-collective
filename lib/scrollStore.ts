/**
 * Single source of truth for scroll-linked state.
 *
 * These are plain mutable objects, not React state, so the WebGL scene can read
 * them every frame in useFrame without triggering re-renders (Vercel rule
 * rerender-use-ref-transient-values). ScrollTrigger writes `scroll.progress`;
 * a pointermove listener writes `pointer`.
 */

export const scroll = {
  /** Overall page scroll progress, 0 at top, 1 at bottom. */
  progress: 0,
};

export const pointer = {
  /** Normalized pointer position, 0..1, origin top-left. */
  x: 0.5,
  y: 0.5,
  /** 1 while the pointer is a fine pointer inside the hero (drives the flashlight). */
  active: 0,
};

// --- math ------------------------------------------------------------------

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function mapRange(
  v: number,
  inMin: number,
  inMax: number,
  outMin = 0,
  outMax = 1,
) {
  const t = clamp((v - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

export function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

// --- ground / foreground colour, driven by tone (0 = night, 1 = deed) --------
// Kept here so the WebGL clear colour and the DOM both read one source.

type RGB = [number, number, number];

const CHARCOAL: RGB = [0.055, 0.047, 0.039]; // #0e0c0a
const CREAM: RGB = [0.965, 0.953, 0.925]; // #f6f3ec
const BONE: RGB = [0.925, 0.902, 0.847]; // #ece6d8
const INK: RGB = [0.102, 0.09, 0.063]; // #1a1710

const mix3 = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/** Ground colour as linear 0..1 triplet for `gl.setClearColor`. */
export const groundRGB = (tone: number): RGB => mix3(CHARCOAL, CREAM, tone);

const css = ([r, g, b]: RGB) =>
  `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;

/** Ground colour as a CSS string for the DOM fallback layer. */
export const groundCSS = (tone: number) => css(mix3(CHARCOAL, CREAM, tone));
/** Foreground text colour as a CSS string, bone → ink with tone. */
export const fgCSS = (tone: number) => css(mix3(BONE, INK, tone));

// --- the arc ---------------------------------------------------------------
//
// The whole page reads from one progress value. Acts and spacers:
//   Act I  (night, hero)      p 0.00 – 0.12
//   spacer night → day        p 0.12 – 0.20
//   Act II (the deed, cream)  p 0.20 – 0.62
//   spacer day → night        p 0.62 – 0.72
//   Act III (legacy, dark)    p 0.72 – 1.00

export interface Stage {
  /** 0 = charcoal ground, 1 = cream ground. Non-monotonic: 0 → 1 → 0. */
  tone: number;
  /** Trunk + branch growth along the curve, 0 → 1. */
  grow: number;
  /** Leaf reveal, 0 → 1. */
  leaves: number;
  /** ASCII presence, 1 = full ASCII, 0 = off (hero only). */
  ascii: number;
  /** Dither → shaded. 0 = full 4-colour dither, 1 = resolved/shaded (legacy). */
  resolve: number;
  /** Root system reveal, 0 → 1 (Act III). */
  roots: number;
  /** Camera dolly-back for the root pull-back, 0 → 1. */
  dolly: number;
  /** Bronze bloom intensity, rises in the legacy. */
  bloom: number;
}

export function deriveStage(p: number): Stage {
  const tone = smoothstep(0.13, 0.21, p) * (1 - smoothstep(0.62, 0.72, p));
  return {
    tone,
    grow: smoothstep(0.04, 0.66, p),
    leaves: smoothstep(0.34, 0.68, p),
    ascii: 1 - smoothstep(0.05, 0.17, p),
    resolve: smoothstep(0.74, 0.93, p),
    roots: smoothstep(0.78, 0.99, p),
    dolly: smoothstep(0.76, 1.0, p),
    bloom: smoothstep(0.72, 0.9, p),
  };
}
