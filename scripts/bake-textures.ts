/**
 * Bakes the static dither textures the no-WebGL / reduced-motion path ships.
 * Run with Node 26 native TypeScript: `node scripts/bake-textures.ts`.
 *
 * This is the one place the genuine (sequential) Atkinson / Floyd–Steinberg
 * kernels are exercised end to end — see lib/dither.ts for why they can't live
 * in the fragment shader.
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  ditherField,
  WARM_PALETTE_DARK,
} from "../lib/dither.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = (name: string) => path.join(root, "public", name);

async function bakeGrain() {
  const w = 512;
  const h = 512;
  const field = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Low, faintly periodic luminance just above the charcoal stop, so the
      // Atkinson pass scatters sparse olive/bronze specks: fine paper tooth.
      const n =
        0.14 +
        0.05 * Math.sin((x / w) * Math.PI * 8) +
        0.05 * Math.cos((y / h) * Math.PI * 6) +
        0.04 * Math.sin(((x + y) / w) * Math.PI * 10);
      field[y * w + x] = n;
    }
  }
  const rgba = ditherField(field, w, h, {
    kernel: "atkinson",
    palette: WARM_PALETTE_DARK,
  });
  await sharp(Buffer.from(rgba.buffer), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(out("grain.png"));
  console.log("wrote public/grain.png");
}

async function bakeLamp() {
  // A soft warm lamp: radial luminance falloff, Floyd–Steinberg. Reads as a
  // single light in a dark room, the hero's mood, as a static poster layer.
  const w = 720;
  const h = 900;
  const cx = w * 0.5;
  const cy = h * 0.42;
  const field = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / (w * 0.7);
      const dy = (y - cy) / (h * 0.7);
      const d = Math.sqrt(dx * dx + dy * dy);
      const v = Math.max(0, 0.72 - d * 0.9);
      field[y * w + x] = v * v; // steeper core, long dark surround
    }
  }
  const rgba = ditherField(field, w, h, {
    kernel: "floyd-steinberg",
    palette: WARM_PALETTE_DARK,
  });
  await sharp(Buffer.from(rgba.buffer), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(out("lamp.png"));
  console.log("wrote public/lamp.png");
}

await bakeGrain();
await bakeLamp();
console.log("done.");
