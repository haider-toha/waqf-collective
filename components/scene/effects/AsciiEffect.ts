import { Effect } from "postprocessing";
import { Uniform, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget } from "three";

/**
 * ASCII pass for the opening. Procedural 5x7 glyphs on a bit grid (no font
 * texture): brightness picks a glyph, densest where the scene is brightest so
 * a dim seed on a dark field reads as sparse characters. Outputs greyscale so
 * the downstream warm-dither pass colourises it. `uReveal` 0 → 1 cross-fades
 * the whole pass off as the plant materialises.
 */

// 5 glyphs, sparsest → densest, packed as 7 rows of 5 bits (bit 0 = left column).
// row order stored top → bottom.
const GLYPHS = [
  [0, 0, 0, 0, 0, 0, 0], // space
  [0, 0, 0, 4, 0, 0, 0], // ·  (single centre dot)
  [0, 14, 17, 17, 17, 14, 0], // o  (ring)
  [10, 31, 10, 31, 10, 31, 10], // #  (hatch)
  [31, 31, 31, 31, 31, 31, 31], // block
];

const flatGlyphs = GLYPHS.flat(); // length 35

const fragment = /* glsl */ `
uniform float uReveal;     // 0 = ASCII, 1 = raw scene
uniform float uCell;       // px per character cell
uniform vec2  uResolution;
uniform vec3  uInk;
uniform vec3  uPaper;

const int GLYPH[35] = int[35](
  ${flatGlyphs.join(", ")}
);

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
  vec2 res = uResolution;
  vec2 fragCoord = uv * res;
  vec2 cell = floor(fragCoord / uCell);
  vec2 inCell = fract(fragCoord / uCell);

  vec3 scene = texture2D(inputBuffer, (cell + 0.5) * uCell / res).rgb;
  float lum = dot(scene, vec3(0.299, 0.587, 0.114));

  int g = int(clamp(floor(lum * 5.0), 0.0, 4.0)); // brighter -> denser glyph
  ivec2 p = ivec2(floor(inCell * vec2(5.0, 7.0)));
  p.x = clamp(p.x, 0, 4);
  p.y = clamp(p.y, 0, 6);

  int row = GLYPH[g * 7 + (6 - p.y)]; // top row first
  float on = float((row >> p.x) & 1);

  vec3 ascii = mix(uPaper, uInk, on);
  outputColor = vec4(mix(ascii, inputColor.rgb, smoothstep(0.0, 1.0, uReveal)), inputColor.a);
}
`;

export interface AsciiOptions {
  reveal?: number;
  cell?: number;
}

export class AsciiEffect extends Effect {
  constructor({ reveal = 0, cell = 9 }: AsciiOptions = {}) {
    super("AsciiEffect", fragment, {
      uniforms: new Map<string, Uniform>([
        ["uReveal", new Uniform(reveal)],
        ["uCell", new Uniform(cell)],
        ["uResolution", new Uniform(new Vector2(1, 1))],
        ["uInk", new Uniform(new Vector3(0.95, 0.93, 0.88))],
        ["uPaper", new Uniform(new Vector3(0.02, 0.018, 0.015))],
      ]),
    });
  }

  update(_renderer: WebGLRenderer, input: WebGLRenderTarget) {
    (this.uniforms.get("uResolution")!.value as Vector2).set(
      input.width,
      input.height,
    );
  }
}
