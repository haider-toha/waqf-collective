import {
  BufferAttribute,
  CatmullRomCurve3,
  Euler,
  Matrix4,
  Quaternion,
  TubeGeometry,
  Vector3,
} from "three";

/**
 * Procedural olive organism. Trunk and branches are Catmull-Rom curves swept
 * into tubes; growth order (which segment appears when, as scroll drives
 * `uGrow` 0→1) is baked per-vertex as `aStart`/`aEnd` so a single shared
 * material reveals the whole plant along its length with no merge step.
 * Leaves come back as instance transforms + reveal/phase/fruit attributes.
 */

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function tagGeometry(
  geo: TubeGeometry,
  start: number,
  end: number,
  span: number,
) {
  const pos = geo.attributes.position;
  const n = pos.count;
  const aStart = new Float32Array(n).fill(start);
  const aEnd = new Float32Array(n).fill(end);
  const aHeight = new Float32Array(n);
  for (let i = 0; i < n; i++) aHeight[i] = pos.getY(i) / span;
  geo.setAttribute("aStart", new BufferAttribute(aStart, 1));
  geo.setAttribute("aEnd", new BufferAttribute(aEnd, 1));
  geo.setAttribute("aHeight", new BufferAttribute(aHeight, 1));
}

export interface LeafData {
  matrices: Float32Array;
  reveal: Float32Array;
  phase: Float32Array;
  fruit: Float32Array;
  count: number;
}

export interface PlantData {
  geometries: TubeGeometry[];
  leaves: LeafData;
  height: number;
}

export function buildPlant(): PlantData {
  const rng = mulberry32(11);
  const height = 3.3;

  const trunkCurve = new CatmullRomCurve3([
    new Vector3(0, 0, 0),
    new Vector3(0.05, 0.7, 0.04),
    new Vector3(-0.09, 1.4, -0.05),
    new Vector3(0.08, 2.1, 0.05),
    new Vector3(-0.02, 2.7, -0.02),
    new Vector3(0.12, height, 0),
  ]);

  const geometries: TubeGeometry[] = [];
  const trunk = new TubeGeometry(trunkCurve, 130, 0.05, 7, false);
  tagGeometry(trunk, 0.0, 0.5, height);
  geometries.push(trunk);

  const attach = [0.42, 0.52, 0.63, 0.72, 0.8, 0.88];
  const up = new Vector3(0, 1, 0);

  const leafMatrices: number[] = [];
  const leafReveal: number[] = [];
  const leafPhase: number[] = [];
  const leafFruit: number[] = [];

  attach.forEach((at, i) => {
    const base = trunkCurve.getPointAt(at);
    const side = i % 2 === 0 ? 1 : -1;
    const outward = new Vector3(
      side * (0.7 + rng() * 0.35),
      0.45 + rng() * 0.4,
      (rng() - 0.5) * 0.6,
    ).normalize();
    const len = 0.9 + rng() * 0.5 - at * 0.35;
    const tip = base
      .clone()
      .add(outward.clone().multiplyScalar(len))
      .add(new Vector3(0, 0.12, 0));
    const mid = base
      .clone()
      .lerp(tip, 0.5)
      .add(new Vector3(0, 0.14 + rng() * 0.1, 0));
    const bcurve = new CatmullRomCurve3([base, mid, tip]);

    const start = 0.4 + at * 0.42;
    const end = Math.min(0.98, start + 0.2);
    const bgeo = new TubeGeometry(bcurve, 40, 0.026, 6, false);
    tagGeometry(bgeo, start, end, height);
    geometries.push(bgeo);

    const leafN = 6 + Math.floor(rng() * 5);
    for (let l = 0; l < leafN; l++) {
      const t = Math.min(0.25 + (l / leafN) * 0.8, 1);
      const p = bcurve.getPointAt(t);
      const tan = bcurve.getTangentAt(t);
      const q = new Quaternion().setFromUnitVectors(up, tan);
      q.multiply(
        new Quaternion().setFromEuler(
          new Euler(rng() * 0.9 - 0.45, rng() * Math.PI * 2, rng() * 0.9 - 0.45),
        ),
      );
      const s = 0.5 + rng() * 0.55;
      const m = new Matrix4().compose(p, q, new Vector3(s, s, s));
      for (let k = 0; k < 16; k++) leafMatrices.push(m.elements[k]);
      leafReveal.push(clamp01((i / attach.length) * 0.65 + rng() * 0.35));
      leafPhase.push(rng() * Math.PI * 2);
      leafFruit.push(rng() < 0.16 ? 1 : 0);
    }
  });

  return {
    geometries,
    height,
    leaves: {
      matrices: new Float32Array(leafMatrices),
      reveal: new Float32Array(leafReveal),
      phase: new Float32Array(leafPhase),
      fruit: new Float32Array(leafFruit),
      count: leafReveal.length,
    },
  };
}

export interface RootData {
  geometries: TubeGeometry[];
  spread: number;
  depth: number;
}

/**
 * The signature. A root system deliberately larger than the canopy: a taproot
 * plus lateral roots fanning wide and deep, each splitting once. Revealed by
 * `uRoots` in the legacy act as the camera pulls back.
 */
export function buildRoots(): RootData {
  const rng = mulberry32(29);
  const depth = 4.6;
  const spread = 3.4;
  const geometries: TubeGeometry[] = [];

  const taproot = new CatmullRomCurve3([
    new Vector3(0, 0, 0),
    new Vector3(-0.05, -0.9, 0.06),
    new Vector3(0.07, -1.9, -0.05),
    new Vector3(-0.03, -3.0, 0.04),
    new Vector3(0.02, -depth, 0),
  ]);
  const tap = new TubeGeometry(taproot, 120, 0.055, 7, false);
  tagGeometry(tap, 0.0, 0.5, -depth);
  geometries.push(tap);

  const laterals = 9;
  for (let i = 0; i < laterals; i++) {
    const angle = (i / laterals) * Math.PI * 2 + rng() * 0.5;
    const startY = -0.15 - rng() * 0.9;
    const base = new Vector3(
      Math.cos(angle) * 0.1,
      startY,
      Math.sin(angle) * 0.1,
    );
    const reach = spread * (0.55 + rng() * 0.45);
    const dropDepth = depth * (0.4 + rng() * 0.5);
    const tip = new Vector3(
      Math.cos(angle) * reach,
      -dropDepth,
      Math.sin(angle) * reach,
    );
    const mid = base.clone().lerp(tip, 0.5).add(
      new Vector3((rng() - 0.5) * 0.5, -0.4 - rng() * 0.6, (rng() - 0.5) * 0.5),
    );
    const curve = new CatmullRomCurve3([base, mid, tip]);
    const start = 0.15 + (i / laterals) * 0.4;
    const end = Math.min(0.96, start + 0.35);
    const geo = new TubeGeometry(curve, 44, 0.03 - i * 0.001, 6, false);
    tagGeometry(geo, start, end, -depth);
    geometries.push(geo);

    // one fine split near the tip
    const splitBase = curve.getPointAt(0.6);
    const splitTip = tip
      .clone()
      .add(new Vector3((rng() - 0.5) * 1.0, -0.6 - rng() * 0.6, (rng() - 0.5) * 1.0));
    const splitCurve = new CatmullRomCurve3([
      splitBase,
      splitBase.clone().lerp(splitTip, 0.5),
      splitTip,
    ]);
    const sgeo = new TubeGeometry(splitCurve, 24, 0.016, 5, false);
    tagGeometry(sgeo, end - 0.05, Math.min(0.99, end + 0.2), -depth);
    geometries.push(sgeo);
  }

  return { geometries, spread, depth };
}
