"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, ShaderMaterial } from "three";
import { buildRoots } from "@/lib/plant-geometry";
import { deriveStage, scroll } from "@/lib/scrollStore";

const rootVertex = /* glsl */ `
  attribute float aStart;
  attribute float aEnd;
  attribute float aHeight;
  uniform float uRoots;
  varying float vLocal;
  varying float vHeight;
  varying float vReveal;
  void main() {
    vLocal = uv.x;
    vHeight = aHeight;
    vReveal = clamp((uRoots - aStart) / max(aEnd - aStart, 1e-4), 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const rootFragment = /* glsl */ `
  varying float vLocal;
  varying float vHeight;
  varying float vReveal;
  void main() {
    if (vLocal > vReveal) discard;
    float tip = smoothstep(vReveal, vReveal - 0.08, vLocal);
    // Hidden gold: roots read brighter than the canopy so they glow when found.
    vec3 base = mix(vec3(0.32, 0.26, 0.16), vec3(0.20, 0.17, 0.11), vHeight);
    vec3 col = mix(base, vec3(0.86, 0.66, 0.40), tip * 0.9);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Roots() {
  const roots = useMemo(() => buildRoots(), []);
  const mat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: rootVertex,
        fragmentShader: rootFragment,
        uniforms: { uRoots: { value: 0 } },
        side: DoubleSide,
      }),
    [],
  );

  useFrame(() => {
    mat.uniforms.uRoots.value = deriveStage(scroll.progress).roots;
  });

  return (
    <group>
      {roots.geometries.map((geo, i) => (
        <mesh key={i} geometry={geo} material={mat} frustumCulled={false} />
      ))}
    </group>
  );
}
