"use client";

import { useEffect, useRef, useState } from "react";
import { deriveStage, scroll } from "@/lib/scrollStore";

/**
 * A warm spotlight that trails the pointer with weight (damped follow, not 1:1)
 * and lights the seed in the dark. Fine pointers only; off for touch and
 * reduced-motion. Fades out as the ground lightens into the deed.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);

    const target = { x: window.innerWidth / 2, y: window.innerHeight * 0.5 };
    const pos = { ...target };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const tick = () => {
      pos.x += (target.x - pos.x) * 0.14;
      pos.y += (target.y - pos.y) * 0.14;
      const el = ref.current;
      if (el) {
        const tone = deriveStage(scroll.progress).tone;
        el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        el.style.opacity = String(Math.max(0, 1 - tone * 2.2) * 0.95);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  return <div ref={ref} className="flashlight" aria-hidden />;
}
