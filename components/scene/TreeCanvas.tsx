"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Color, MathUtils } from "three";
import { Plant } from "./Plant";
import { Roots } from "./Roots";
import { PostFX } from "./PostFX";
import { clamp, deriveStage, lerp, scroll } from "@/lib/scrollStore";

function CameraRig() {
  const { camera, gl, size } = useThree();
  const dark = useMemo(() => new Color("#0e0c0a"), []);
  const light = useMemo(() => new Color("#f6f3ec"), []);
  const clear = useMemo(() => new Color("#0e0c0a"), []);
  const cur = useRef({ z: 2.4, y: 0.5, look: 0.2 });

  useFrame((_, dt) => {
    const s = deriveStage(scroll.progress);

    // Responsive framing: a taller/narrower viewport pulls the camera back.
    const aspect = size.width / Math.max(size.height, 1);
    const fit = aspect < 0.7 ? 1.55 : aspect < 1 ? 1.25 : 1;

    const grown = clamp(s.grow / 0.7, 0, 1);
    const baseLook = lerp(0.25, 1.75, grown);
    const look = lerp(baseLook, -1.35, s.dolly);
    let z = lerp(2.5, 5.4, grown);
    z = lerp(z, 10.8, s.dolly) * fit;
    const y = look + lerp(0.35, 1.2, s.dolly);

    // frame-rate independent damping toward the scroll target
    const k = 1 - Math.pow(0.0018, dt);
    cur.current.z = MathUtils.lerp(cur.current.z, z, k);
    cur.current.y = MathUtils.lerp(cur.current.y, y, k);
    cur.current.look = MathUtils.lerp(cur.current.look, look, k);

    camera.position.set(0.25, cur.current.y, cur.current.z);
    camera.lookAt(0, cur.current.look, 0);

    clear.copy(dark).lerp(light, s.tone);
    gl.setClearColor(clear, 1);
  });

  return null;
}

export default function TreeCanvas() {
  return (
    <Canvas
      style={{ width: "100%", height: "100%", display: "block" }}
      dpr={[1, 1.75]}
      gl={{ alpha: false, antialias: false, powerPreference: "high-performance" }}
      camera={{ fov: 40, near: 0.1, far: 100, position: [0.25, 0.5, 2.5] }}
      frameloop="always"
    >
      <group position={[-0.08, 0, 0]}>
        <Plant />
        <Roots />
      </group>
      <CameraRig />
      <PostFX />
    </Canvas>
  );
}
