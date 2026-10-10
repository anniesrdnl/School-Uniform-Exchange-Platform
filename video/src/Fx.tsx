import React from "react";
import { Audio, Sequence, random, staticFile, useCurrentFrame } from "remotion";
import { C } from "./theme";

const COLORS = [C.white, C.cream, C.powder, C.denim, C.navy];

/** Confetti burst from (x, y), in the coordinate space of the parent. Fully deterministic. */
export const Confetti: React.FC<{ at: number; x: number; y: number; n?: number; seed?: number; power?: number; size?: number }> = ({
  at,
  x,
  y,
  n = 70,
  seed = 1,
  power = 1,
  size = 1,
}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 80) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, zIndex: 60, pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const r = (k: number) => random(`${seed}-${i}-${k}`);
        const ang = -Math.PI / 2 + (r(1) - 0.5) * Math.PI * 1.1;
        const sp = (6 + r(2) * 12) * power;
        const px = x + Math.cos(ang) * sp * t * 0.9;
        const py = y + Math.sin(ang) * sp * t * 0.9 + 0.5 * 0.55 * t * t;
        const w = (7 + r(3) * 9) * size;
        const round = r(4) > 0.6;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: w,
              height: round ? w : w * 0.5,
              borderRadius: round ? "50%" : 2,
              background: COLORS[Math.floor(r(5) * COLORS.length)],
              opacity: Math.min(1, (80 - t) / 25),
              boxShadow: "0 0 0 1px rgba(14,54,97,.25)",
              transform: `rotate(${r(6) * 360 + t * (r(7) - 0.5) * 30}deg) scaleY(${Math.cos(t / 4 + r(8) * 6)})`,
            }}
          />
        );
      })}
    </div>
  );
};

/** Plays a sound effect (public/sfx/<name>.wav) at a scene-local frame */
export const Sfx: React.FC<{ at: number; name: string; volume?: number; dur?: number }> = ({ at, name, volume = 0.6, dur = 60 }) => (
  <Sequence from={at} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
