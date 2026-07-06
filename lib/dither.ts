/**
 * Error-diffusion dithering to the warm 4-colour palette.
 *
 * Genuine Floyd–Steinberg and Atkinson kernels. Both are *sequential* — each
 * pixel's quantisation error is pushed into neighbours that haven't been
 * processed yet — which is exactly why real error diffusion cannot run in a
 * single WebGL fragment pass (a fragment can't see its neighbours' results).
 * So the live scene approximates the look on the GPU with ordered Bayer + a
 * stochastic term, and these CPU kernels bake the static poster/texture the
 * no-WebGL and reduced-motion visitors get instead.
 */

export type RGB = [number, number, number];

// Warm ramps, darkest → lightest, as 0..255 triplets.
export const WARM_PALETTE_DARK: RGB[] = [
  [0x0e, 0x0c, 0x0a], // charcoal
  [0x56, 0x5b, 0x43], // olive
  [0xb0, 0x8d, 0x57], // bronze
  [0xec, 0xe6, 0xd8], // bone
];

export const WARM_PALETTE_LIGHT: RGB[] = [
  [0x1a, 0x17, 0x10], // ink
  [0x56, 0x5b, 0x43], // olive
  [0x8a, 0x6a, 0x3f], // bronze-deep
  [0xf6, 0xf3, 0xec], // cream
];

export const luminance = (r: number, g: number, b: number) =>
  0.299 * r + 0.587 * g + 0.114 * b;

// [dx, dy, weight]; weights sum to `div`. Atkinson deliberately discards 2/8
// of the error, which is why it holds highlights and reads like an old print.
const KERNELS = {
  "floyd-steinberg": {
    div: 16,
    taps: [
      [1, 0, 7],
      [-1, 1, 3],
      [0, 1, 5],
      [1, 1, 1],
    ] as const,
  },
  atkinson: {
    div: 8,
    taps: [
      [1, 0, 1],
      [2, 0, 1],
      [-1, 1, 1],
      [0, 1, 1],
      [1, 1, 1],
      [0, 2, 1],
    ] as const,
  },
};

export type KernelName = keyof typeof KERNELS;

interface DitherOptions {
  kernel?: KernelName;
  palette?: RGB[];
}

/**
 * Diffuse a luminance field (values 0..1, row-major, length w*h) onto a
 * 4-colour palette and return RGBA bytes ready for an ImageData or sharp.
 */
export function ditherField(
  field: Float32Array | number[],
  w: number,
  h: number,
  { kernel = "floyd-steinberg", palette = WARM_PALETTE_DARK }: DitherOptions = {},
): Uint8ClampedArray {
  const k = KERNELS[kernel];
  const lum = Float32Array.from(field); // mutable work copy for diffusion
  const out = new Uint8ClampedArray(w * h * 4);
  // Quantise against each palette entry's own luminance stop (0..1).
  const stops = palette.map(([r, g, b]) => luminance(r, g, b) / 255);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const oldVal = lum[i];

      let bi = 0;
      let bd = Infinity;
      for (let s = 0; s < stops.length; s++) {
        const d = Math.abs(stops[s] - oldVal);
        if (d < bd) {
          bd = d;
          bi = s;
        }
      }

      const err = oldVal - stops[bi];
      for (const [dx, dy, wt] of k.taps) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        lum[ny * w + nx] += (err * wt) / k.div;
      }

      const [pr, pg, pb] = palette[bi];
      const o = i * 4;
      out[o] = pr;
      out[o + 1] = pg;
      out[o + 2] = pb;
      out[o + 3] = 255;
    }
  }
  return out;
}
