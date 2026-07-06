"use client";

import { useEffect, useRef } from "react";
import { deriveStage, scroll } from "@/lib/scrollStore";

/**
 * The plant for visitors without WebGL or with reduced motion. It still grows
 * on scroll (stroke-dashoffset, no shaders, no cursor) and the roots still out-
 * reach the canopy, so the thesis survives. The baked Floyd–Steinberg lamp
 * (public/lamp.png) supplies the warm-dither mood on the dark grounds.
 */
export function PosterFallback() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const s = deriveStage(scroll.progress);
      const el = ref.current;
      if (el) {
        el.style.setProperty("--grow", String(s.grow));
        el.style.setProperty("--roots", String(s.roots));
        el.style.setProperty("--lamp", String(Math.max(0, 1 - s.tone * 2)));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={ref} className="poster" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/lamp.png" alt="" className="poster__lamp" />
      <svg
        className="poster__svg"
        viewBox="0 0 300 1000"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <g className="poster__branches">
          <path pathLength={1} d="M150 645 C 148 560 156 470 150 380 C 146 300 154 210 150 130" />
          <path pathLength={1} d="M152 470 C 120 455 95 435 70 400" />
          <path pathLength={1} d="M150 400 C 185 388 210 368 235 335" />
          <path pathLength={1} d="M151 300 C 128 288 110 268 92 240" />
          <path pathLength={1} d="M150 230 C 172 220 190 202 205 178" />
          <path pathLength={1} d="M150 130 C 150 112 150 96 150 82" />
        </g>
        <g className="poster__leaves">
          {[
            [70, 400],
            [235, 335],
            [92, 240],
            [205, 178],
            [150, 82],
            [120, 448],
            [200, 372],
            [110, 262],
          ].map(([cx, cy], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={9} ry={4.5} transform={`rotate(${(i * 47) % 360} ${cx} ${cy})`} />
          ))}
        </g>
        <g className="poster__roots">
          <path pathLength={1} d="M150 645 C 152 720 146 800 150 905" />
          <path pathLength={1} d="M150 660 C 110 700 80 762 55 852" />
          <path pathLength={1} d="M150 660 C 190 700 220 762 245 852" />
          <path pathLength={1} d="M150 700 C 125 762 110 822 100 942" />
          <path pathLength={1} d="M150 700 C 175 762 190 822 200 942" />
        </g>
      </svg>
    </div>
  );
}
