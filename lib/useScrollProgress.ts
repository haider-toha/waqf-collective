"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/**
 * Scroll-scrub driver. While `ref` is anywhere near the viewport it runs a
 * requestAnimationFrame loop and calls `onProgress(p)` with p in [0,1] — how far
 * the element's own scroll span has advanced past a one-viewport pin:
 *   p = 0  when the element's top reaches the top of the viewport (pin engages)
 *   p = 1  when its bottom reaches the bottom of the viewport (pin releases)
 * i.e. progress through the element's `height - 100vh` of scroll travel.
 *
 * The hook writes nothing itself — the caller mutates the DOM imperatively
 * (opacity / transform on its own layers), so there is NO per-frame React
 * re-render. Values that change every frame live outside React state, per the
 * repo's transient-value rule.
 *
 * `enabled: false` (mobile, reduced motion) => the loop never starts; the hook
 * calls `onProgress(1)` once so callers settle to the fully-revealed state and
 * let CSS own the layout. StrictMode-safe: the effect double-invokes in dev, so
 * every rAF + observer is torn down in cleanup (mirrors Experience.tsx).
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
  enabled = true,
) {
  // use-latest: always call the freshest callback without re-subscribing the loop
  const cbRef = useRef(onProgress);
  cbRef.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!enabled) {
      cbRef.current(1); // settle to fully-revealed; CSS handles the rest
      return;
    }

    let raf = 0;
    let running = false;
    let last = -1;

    const frame = () => {
      // one read, then the caller does only writes — no read/write interleave
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = rect.height - vh;
      const p = span > 0 ? clamp(-rect.top / span, 0, 1) : rect.top <= 0 ? 1 : 0;
      if (p !== last) {
        last = p;
        cbRef.current(p);
      }
      raf = requestAnimationFrame(frame);
    };

    // Only spin the loop while the section is near the viewport; park it otherwise.
    const io = new IntersectionObserver(
      (entries) => {
        const near = entries[0]?.isIntersecting ?? false;
        if (near && !running) {
          running = true;
          raf = requestAnimationFrame(frame);
        } else if (!near && running) {
          running = false;
          if (raf) cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "40% 0px 40% 0px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, enabled]);
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * smoothstep — eased 0..1 ramp of `p` across the window [a,b]. Turns global
 * scroll progress into a per-stage local progress with soft ends, so each growth
 * stage eases in rather than wiping in linearly.
 */
export function smoothstep(a: number, b: number, p: number) {
  if (a === b) return p < a ? 0 : 1;
  const t = clamp((p - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
