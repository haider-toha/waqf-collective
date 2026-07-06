"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, wrapEffect } from "@react-three/postprocessing";
import { BloomEffect } from "postprocessing";
import { WarmDitherEffect } from "./effects/WarmDitherEffect";
import { AsciiEffect } from "./effects/AsciiEffect";
import { deriveStage, lerp, scroll } from "@/lib/scrollStore";

const WarmDither = wrapEffect(WarmDitherEffect);
const Ascii = wrapEffect(AsciiEffect);

export function PostFX() {
  const asciiRef = useRef<AsciiEffect | null>(null);
  const ditherRef = useRef<WarmDitherEffect | null>(null);
  const bloomRef = useRef<BloomEffect | null>(null);

  useFrame(() => {
    const s = deriveStage(scroll.progress);

    if (asciiRef.current) {
      // stage.ascii: 1 = full ASCII (hero) → uReveal 0; fades off as plant grows.
      asciiRef.current.uniforms.get("uReveal")!.value = 1 - s.ascii;
    }
    if (ditherRef.current) {
      const u = ditherRef.current.uniforms;
      u.get("uResolve")!.value = s.resolve;
      u.get("uTone")!.value = s.tone;
      u.get("uPixelSize")!.value = lerp(3.2, 1.4, s.resolve);
    }
    if (bloomRef.current) {
      // Bronze only blooms on the dark grounds; the cream deed stays matte.
      bloomRef.current.intensity = (1 - s.tone) * (0.35 + 1.05 * s.bloom);
    }
  });

  return (
    <EffectComposer>
      <Ascii ref={asciiRef} />
      <WarmDither ref={ditherRef} />
      <Bloom
        ref={bloomRef}
        intensity={0.4}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.28}
        mipmapBlur
        radius={0.7}
      />
    </EffectComposer>
  );
}
