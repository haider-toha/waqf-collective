"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

const SRC = "/opt/image-1.webp";
// The softened cream. image-1.webp's field was recoloured to this exact value,
// so the canvas ground the tiles rest on is byte-identical to the WebP's field
// — no visible seam between the CSS ground, the raw <img> before the canvas
// paints, and the canvas itself. Keep in sync with --cream (globals.css) and
// themeColor (layout.tsx).
const CREAM = "#f7f1e6";

/**
 * The sapling as a living pixel grid. The source mosaic is sampled into a dense
 * field of tiles; each springs home but is shoved aside by the pointer, so the
 * pixels scatter under your cursor and settle back — you touch the image itself.
 *
 * The resting grid is rendered once to an offscreen buffer and blitted each
 * frame; only tiles actually displaced near the pointer are erased and redrawn,
 * so the field can be fine (tens of thousands of tiles) and still hold 60fps.
 * The <Image> stays as the LCP and the fallback for reduced-motion, where the
 * grid never starts and the flat mosaic shows instead. On touch, the same
 * scatter runs and follows the finger — the canvas is pointer-events: none so
 * scrolling stays native underneath.
 */
export function HeroSapling() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // We used to gate this to fine pointers only, so phones got a static image
    // and no interaction. `pointermove` fires for touch too, and the canvas is
    // pointer-events: none, so a finger drag now scatters pixels along its
    // path while the page still scrolls normally underneath.
    if (reduce) return;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const FOCAL_X = 0.5;
    // Vertical crop origin, mirroring the CSS `object-position` on .img so the
    // <img> LCP and the canvas paint sit exactly on top of one another. The
    // sapling's top pixel is only ~2% down the source, so under 900px (where
    // portrait viewports force a vertical crop) we top-align to keep the leaf
    // tip intact and let the mound bleed off the bottom. Kept in sync with the
    // ≤900px override for .img in Hero.module.css.
    const FRICTION = 0.86;
    const SPRING = 0.08;

    type Tile = {
      hx: number;
      hy: number; // home
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
    };
    let tiles: Tile[] = [];
    let active: Int32Array = new Int32Array(0); // scratch: indices disturbed this frame
    let base: HTMLCanvasElement | null = null;
    let cssW = 0,
      cssH = 0;
    let cellW = 10,
      cellH = 10,
      size = 8;
    let radius = 130,
      push = 6;
    let ready = false;
    let painted = false;
    const mouse = { x: -9999, y: -9999 };

    const img = new window.Image();
    img.decoding = "async";

    const build = () => {
      cssW = wrap.clientWidth;
      cssH = wrap.clientHeight;
      if (!cssW || !cssH || !img.width) return;

      canvas.width = Math.round(cssW * DPR);
      canvas.height = Math.round(cssH * DPR);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      const FOCAL_Y = cssW <= 900 ? 0 : 0.5;

      // dense grid — ~8–11px tiles, so the sapling keeps its detail. The source
      // caps out around 260 columns of real detail, so we stay under that.
      const cell = Math.max(7, Math.min(11, Math.round(cssW / 220)));
      const cols = Math.max(24, Math.min(260, Math.round(cssW / cell)));
      const rows = Math.max(1, Math.round(cssH / cell));
      cellW = cssW / cols;
      cellH = cssH / rows;
      size = Math.min(cellW, cellH) * 0.86;

      // sample the source at grid resolution with object-fit:cover framing
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const octx = off.getContext("2d");
      if (!octx) return;
      const targetAspect = cols / rows;
      const srcAspect = img.width / img.height;
      let sw: number, sh: number, sx: number, sy: number;
      if (srcAspect > targetAspect) {
        sh = img.height;
        sw = sh * targetAspect;
        sx = (img.width - sw) * FOCAL_X;
        sy = 0;
      } else {
        sw = img.width;
        sh = sw / targetAspect;
        sx = 0;
        sy = (img.height - sh) * FOCAL_Y;
      }
      octx.imageSmoothingEnabled = true;
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
      const data = octx.getImageData(0, 0, cols, rows).data;

      // field colour = top-left corner; tiles matching it are dropped so only
      // the sapling is made of pixels and the gaps read as cream
      const fr = data[0],
        fg = data[1],
        fb = data[2];
      const next: Tile[] = [];
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const k = (j * cols + i) * 4;
          const r = data[k],
            g = data[k + 1],
            b = data[k + 2];
          if (Math.abs(r - fr) + Math.abs(g - fg) + Math.abs(b - fb) < 26)
            continue;
          const hx = (i + 0.5) * cellW;
          const hy = (j + 0.5) * cellH;
          next.push({
            hx,
            hy,
            x: hx,
            y: hy,
            vx: 0,
            vy: 0,
            color: `rgb(${r},${g},${b})`,
          });
        }
      }
      tiles = next;
      active = new Int32Array(tiles.length);
      // tight, local disturbance — a small ball right under the cursor
      radius = Math.max(26, Math.min(52, cssW * 0.03));
      push = radius * 0.06;

      // pre-render the resting field once; the loop blits this and only repaints
      // the handful of tiles the pointer disturbs
      base = document.createElement("canvas");
      base.width = canvas.width;
      base.height = canvas.height;
      const bctx = base.getContext("2d", { alpha: false });
      if (!bctx) return;
      bctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      bctx.fillStyle = CREAM;
      bctx.fillRect(0, 0, cssW, cssH);
      const half = size / 2;
      for (let n = 0; n < tiles.length; n++) {
        const p = tiles[n];
        bctx.fillStyle = p.color;
        bctx.fillRect(p.hx - half, p.hy - half, size, size);
      }
      ready = true;
    };

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!ready || !base) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const r2 = radius * radius;
      const half = size / 2;
      // pass 1 — integrate every tile, and erase the home cell of any knocked off
      // home (the rest live in the blit). Collect the disturbed ones.
      let count = 0;
      ctx.fillStyle = CREAM;
      for (let n = 0; n < tiles.length; n++) {
        const p = tiles[n];
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2) {
          const d = Math.sqrt(d2) || 0.0001;
          const f = ((radius - d) / radius) * push;
          p.vx -= (dx / d) * f;
          p.vy -= (dy / d) * f;
        }
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx + (p.hx - p.x) * SPRING;
        p.y += p.vy + (p.hy - p.y) * SPRING;
        const off =
          p.x - p.hx > 0.4 ||
          p.hx - p.x > 0.4 ||
          p.y - p.hy > 0.4 ||
          p.hy - p.y > 0.4 ||
          p.vx > 0.05 ||
          p.vx < -0.05 ||
          p.vy > 0.05 ||
          p.vy < -0.05;
        if (off) {
          active[count++] = n;
          ctx.fillRect(p.hx - cellW / 2, p.hy - cellH / 2, cellW, cellH);
        }
      }
      // pass 2 — draw the disturbed tiles at their current spot, after every
      // home has been cleared, so overlapping scatter never clips a neighbour
      for (let a = 0; a < count; a++) {
        const p = tiles[active[a]];
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - half, p.y - half, size, size);
      }
      if (!painted) {
        painted = true;
        canvas.style.opacity = "1";
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    let resizeT = 0;
    const onResize = () => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(build, 150);
    };

    img.onload = build;
    img.src = SRC;

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onLeave, { passive: true });
    window.addEventListener("pointercancel", onLeave, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onLeave);
      window.removeEventListener("pointercancel", onLeave);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeT);
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.imgWrap}>
      {/* flat mosaic — the LCP, and the fallback for touch / reduced-motion */}
      <Image
        src={SRC}
        alt=""
        fill
        preload
        sizes="100vw"
        className={styles.img}
      />
      {/* interactive pixel grid, drawn over the mosaic once sampled */}
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
    </div>
  );
}
