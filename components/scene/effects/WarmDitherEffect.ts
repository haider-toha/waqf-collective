import { Effect } from "postprocessing";
import { Uniform, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from "three";

/**
 * Warm 4-colour dithering pass.
 *
 * Samples the rendered scene, pixelates it, quantises luminance to a 4-level
 * ramp with an ordered (Bayer) threshold blended toward a stochastic one, and
 * maps each level to a warm palette. Two ramps — one for the charcoal ground,
 * one for the cream ground — are cross-faded by `uTone`, so the same effect
 * reads as glowing gilt at night and as engraving on paper. `uResolve` fades
 * the whole thing toward the raw shaded scene for the legacy act.
 *
 * True error diffusion (Floyd–Steinberg / Atkinson) is sequential and lives in
 * lib/dither.ts (CPU, for the poster). This is the single-pass GPU cousin.
 */

// Palettes as linear-ish 0..1 triplets, darkest → lightest.
const palDark = [
  new Vector3(0.055, 0.047, 0.039), // #0e0c0a charcoal
  new Vector3(0.337, 0.357, 0.263), // #565b43 olive
  new Vector3(0.69, 0.553, 0.341), // #b08d57 bronze
  new Vector3(0.925, 0.902, 0.847), // #ece6d8 bone
];
const palLight = [
  new Vector3(0.102, 0.09, 0.063), // #1a1710 ink
  new Vector3(0.337, 0.357, 0.263), // #565b43 olive
  new Vector3(0.541, 0.416, 0.247), // #8a6a3f bronze-deep
  new Vector3(0.965, 0.953, 0.925), // #f6f3ec cream
];

const fragment = /* glsl */ `
uniform float uResolve;   // 0 = full dither, 1 = raw shaded scene
uniform float uTone;      // 0 = dark ramp, 1 = light ramp
uniform float uPixelSize; // px per dither cell
uniform float uErrorMix;  // 0 = ordered Bayer, 1 = stochastic
uniform vec2  uResolution;
uniform vec3  uPalDark[4];
uniform vec3  uPalLight[4];

const float BAYER[16] = float[16](
   0.0,  8.0,  2.0, 10.0,
  12.0,  4.0, 14.0,  6.0,
   3.0, 11.0,  1.0,  9.0,
  15.0,  7.0, 13.0,  5.0
);

float orderedThreshold(vec2 cell){
  int ix = int(mod(cell.x, 4.0));
  int iy = int(mod(cell.y, 4.0));
  return (BAYER[iy * 4 + ix] + 0.5) / 16.0;
}

float hashThreshold(vec2 cell){
  return fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
  vec2 res = uResolution;
  float ps = max(uPixelSize, 1.0);
  vec2 cell = floor(uv * res / ps);
  vec2 snapUV = (cell + 0.5) * ps / res;
  vec3 scene = texture2D(inputBuffer, snapUV).rgb;

  float lum = dot(scene, vec3(0.299, 0.587, 0.114));
  float thr = mix(orderedThreshold(cell), hashThreshold(cell), uErrorMix);

  float levels = 4.0;
  float q = floor(clamp(lum + (thr - 0.5) / levels, 0.0, 1.0) * (levels - 1.0) + 0.5);
  int idx = int(q);
  vec3 warm = mix(uPalDark[idx], uPalLight[idx], uTone);

  outputColor = vec4(mix(warm, inputColor.rgb, smoothstep(0.0, 1.0, uResolve)), inputColor.a);
}
`;

export interface WarmDitherOptions {
  resolve?: number;
  tone?: number;
  pixelSize?: number;
  errorMix?: number;
}

export class WarmDitherEffect extends Effect {
  constructor({
    resolve = 0,
    tone = 0,
    pixelSize = 3,
    errorMix = 0.35,
  }: WarmDitherOptions = {}) {
    super("WarmDitherEffect", fragment, {
      uniforms: new Map<string, Uniform>([
        ["uResolve", new Uniform(resolve)],
        ["uTone", new Uniform(tone)],
        ["uPixelSize", new Uniform(pixelSize)],
        ["uErrorMix", new Uniform(errorMix)],
        ["uResolution", new Uniform(new Vector2(1, 1))],
        ["uPalDark", new Uniform(palDark)],
        ["uPalLight", new Uniform(palLight)],
      ]),
    });
  }

  update(_renderer: WebGLRenderer, input: WebGLRenderTarget) {
    const res = this.uniforms.get("uResolution")!.value as Vector2;
    res.set(input.width, input.height);
  }
}
