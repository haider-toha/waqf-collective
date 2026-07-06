"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import { buildPlant } from "@/lib/plant-geometry";
import { deriveStage, scroll } from "@/lib/scrollStore";

const branchVertex = /* glsl */ `
  attribute float aStart;
  attribute float aEnd;
  attribute float aHeight;
  uniform float uGrow;
  uniform float uTime;
  varying float vLocal;
  varying float vHeight;
  varying float vReveal;
  void main() {
    vLocal = uv.x;
    vHeight = aHeight;
    float localGrow = clamp((uGrow - aStart) / max(aEnd - aStart, 1e-4), 0.0, 1.0);
    vReveal = localGrow;
    float grown = step(uv.x, localGrow);
    float ph = aHeight * 3.0;
    float sway = sin(ph + uTime * 1.1) * 0.6
               + sin(ph * 1.7 + uTime * 1.5) * 0.3
               + sin(ph * 3.1 + uTime * 2.3) * 0.1;
    vec3 p = position;
    p.x += sway * aHeight * 0.06 * grown;
    p.z += sway * aHeight * 0.03 * grown;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const branchFragment = /* glsl */ `
  varying float vLocal;
  varying float vHeight;
  varying float vReveal;
  void main() {
    if (vLocal > vReveal) discard;
    float tip = smoothstep(vReveal, vReveal - 0.06, vLocal);
    vec3 base = mix(vec3(0.13, 0.14, 0.10), vec3(0.34, 0.36, 0.26), vHeight);
    vec3 col = mix(base, vec3(0.80, 0.61, 0.36), tip * 0.85);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const leafVertex = /* glsl */ `
  attribute float aReveal;
  attribute float aPhase;
  attribute float aFruit;
  uniform float uLeaves;
  uniform float uTime;
  varying vec2 vUv;
  varying float vFruit;
  varying float vShade;
  void main() {
    vUv = uv;
    vFruit = aFruit;
    vShade = fract(aPhase * 0.159);
    float pop = smoothstep(aReveal, aReveal + 0.14, uLeaves);
    vec4 world = instanceMatrix * vec4(position * pop, 1.0);
    world.x += sin(uTime * 1.4 + aPhase) * 0.02 * pop;
    world.z += cos(uTime * 1.1 + aPhase) * 0.012 * pop;
    gl_Position = projectionMatrix * modelViewMatrix * world;
  }
`;

const leafFragment = /* glsl */ `
  varying vec2 vUv;
  varying float vFruit;
  varying float vShade;
  void main() {
    vec2 c = vUv - 0.5;
    float d = length(vec2(c.x * 2.0, c.y * 1.15));
    if (d > 0.5) discard;
    vec3 leaf = mix(vec3(0.20, 0.24, 0.15), vec3(0.42, 0.44, 0.31), vShade);
    vec3 fruit = vec3(0.88, 0.64, 0.36);
    vec3 col = mix(leaf, fruit, vFruit);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function Plant() {
  const plant = useMemo(() => buildPlant(), []);
  const seedRef = useRef<Mesh>(null);
  const instRef = useRef<InstancedMesh>(null);

  const branchMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: branchVertex,
        fragmentShader: branchFragment,
        uniforms: { uGrow: { value: 0 }, uTime: { value: 0 } },
        side: DoubleSide,
      }),
    [],
  );

  const leafMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: leafVertex,
        fragmentShader: leafFragment,
        uniforms: { uLeaves: { value: 0 }, uTime: { value: 0 } },
        side: DoubleSide,
      }),
    [],
  );

  const leafGeo = useMemo(() => {
    const g = new PlaneGeometry(0.14, 0.2);
    g.setAttribute("aReveal", new InstancedBufferAttribute(plant.leaves.reveal, 1));
    g.setAttribute("aPhase", new InstancedBufferAttribute(plant.leaves.phase, 1));
    g.setAttribute("aFruit", new InstancedBufferAttribute(plant.leaves.fruit, 1));
    return g;
  }, [plant]);

  const seedColor = useMemo(() => new Color(0.42, 0.34, 0.2), []);

  useEffect(() => {
    const mesh = instRef.current;
    if (!mesh) return;
    mesh.instanceMatrix.set(plant.leaves.matrices);
    mesh.instanceMatrix.needsUpdate = true;
  }, [plant]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = deriveStage(scroll.progress);
    branchMat.uniforms.uGrow.value = s.grow;
    branchMat.uniforms.uTime.value = t;
    leafMat.uniforms.uLeaves.value = s.leaves;
    leafMat.uniforms.uTime.value = t;
    if (seedRef.current) {
      const shrink = 1 - Math.min(1, Math.max(0, (s.grow - 0.02) / 0.14));
      const sc = 0.2 + shrink * 0.8;
      seedRef.current.scale.setScalar(sc);
      seedRef.current.visible = sc > 0.22;
    }
  });

  return (
    <group>
      <mesh ref={seedRef} position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.09, 18, 16]} />
        <meshBasicMaterial color={seedColor} />
      </mesh>

      {plant.geometries.map((geo, i) => (
        <mesh key={i} geometry={geo} material={branchMat} frustumCulled={false} />
      ))}

      <instancedMesh
        ref={instRef}
        args={[leafGeo, leafMat, plant.leaves.count]}
        frustumCulled={false}
      />
    </group>
  );
}
