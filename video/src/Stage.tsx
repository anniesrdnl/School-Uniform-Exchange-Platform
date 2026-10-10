import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, clamp, ease, fontFamily, prog } from "./theme";

export const Background: React.FC<{ dim?: boolean }> = ({ dim }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.navy} 0%, ${C.deep} 70%, #061628 100%)` }}>
      <div style={{ position: "absolute", right: -200, top: -260, width: 900, height: 900, borderRadius: "50%", background: `${C.denim}59`, filter: "blur(120px)", transform: `translate(${Math.sin(f / 70) * 50}px, ${Math.cos(f / 70) * 40}px)`, opacity: dim ? 0.5 : 1 }} />
      <div style={{ position: "absolute", left: -240, bottom: -320, width: 800, height: 800, borderRadius: "50%", background: `${C.cream}1a`, filter: "blur(120px)", transform: `translate(${Math.cos(f / 80) * 50}px, ${Math.sin(f / 80) * 40}px)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.07) 1.5px, transparent 1.5px)", backgroundSize: "34px 34px" }} />
    </AbsoluteFill>
  );
};

/** Kinetic headline at the top of a screen-recording scene: words slide in at their own frame */
export const Headline: React.FC<{ words: { t: string; at: number }[]; top?: number; size?: number }> = ({ words, top = 12, size = 48 }) => {
  const f = useCurrentFrame();
  const last = words.reduce((a, w, i) => (f >= w.at ? i : a), -1);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, height: 80, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, fontFamily, fontSize: size, fontWeight: 700, color: C.white, letterSpacing: -0.5 }}>
      {words.map((w, i) => {
        const p = prog(f, w.at, w.at + 14);
        const active = i === last && w.t !== "•";
        return (
          <span key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 26}px)`, padding: "2px 20px", borderRadius: 16, background: active ? "rgba(255,255,255,.14)" : "transparent", boxShadow: active ? "inset 0 0 0 1px rgba(255,255,255,.22)" : "none", color: active ? C.white : "rgba(255,255,255,.78)" }}>
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

/** Voice-over text as subtitles; words light up as the line is "spoken" */
export const Caption: React.FC<{ text: string; from?: number; to: number; duration: number }> = ({ text, from = 10, to, duration }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  const opacity = interpolate(f, [from, from + 10, duration - 12, duration - 2], [0, 1, 1, 0], clamp);
  const spoken = interpolate(f, [from + 6, to], [0, words.length], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, display: "flex", justifyContent: "center", opacity, fontFamily }}>
      <div style={{ maxWidth: 1480, padding: "10px 28px", borderRadius: 18, background: "rgba(6,22,40,.72)", backdropFilter: "blur(6px)", textAlign: "center", fontSize: 25, lineHeight: 1.35, fontWeight: 500 }}>
        {words.map((w, i) => (
          <span key={i} style={{ color: i < spoken ? C.white : "rgba(255,255,255,.45)" }}>{w}{i < words.length - 1 ? " " : ""}</span>
        ))}
      </div>
    </div>
  );
};

/** Browser window, 1536x862. Children are laid out in a 1280x680 viewport that is scaled 1.2x. */
export const Window: React.FC<{ children: React.ReactNode; cam?: { s: number; x: number; y: number }; url?: string; delay?: number }> = ({
  children,
  cam = { s: 1, x: 0, y: 0 },
  url = "school-uniform-exchange-platform.vercel.app",
  delay = 0,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        position: "absolute",
        left: 192,
        top: 104,
        width: 1536,
        height: 862,
        borderRadius: 18,
        overflow: "hidden",
        background: C.white,
        boxShadow: "0 40px 90px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.12)",
        opacity: s,
        transform: `translateY(${(1 - s) * 50}px) scale(${0.95 + 0.05 * s})`,
        fontFamily,
      }}
    >
      <div style={{ height: 46, background: "#e9edf1", display: "flex", alignItems: "center", padding: "0 18px", gap: 8 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
        ))}
        <div style={{ margin: "0 auto", transform: "translateX(-30px)", width: 520, height: 28, borderRadius: 14, background: C.white, fontSize: 14, color: C.s500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          🔒 {url}
        </div>
      </div>
      <div style={{ width: 1536, height: 816, overflow: "hidden", position: "relative" }}>
        <div style={{ width: 1280, height: 680, transformOrigin: "0 0", transform: `translate(${cam.x}px, ${cam.y}px) scale(${1.2 * cam.s})`, position: "relative" }}>{children}</div>
      </div>
    </div>
  );
};

export type Key = { f: number; x: number; y: number };

export const cursorAt = (keys: Key[], f: number) => ({
  x: interpolate(f, keys.map((k) => k.f), keys.map((k) => k.x), { ...clamp, easing: ease }),
  y: interpolate(f, keys.map((k) => k.f), keys.map((k) => k.y), { ...clamp, easing: ease }),
});

/** Camera that pushes in on the cursor around each click and eases back out */
export const followCam = (keys: Key[], clicks: number[], f: number, amount = 0.1) => {
  const p = clicks.reduce((m, c) => Math.max(m, interpolate(f, [c - 16, c - 3, c + 20, c + 42], [0, 1, 1, 0], clamp)), 0);
  const { x, y } = cursorAt(keys, f);
  const s = 1 + amount * p;
  return { s, x: 1.2 * x * (1 - s), y: 1.2 * y * (1 - s) };
};

/** Mouse cursor in the parent's coordinate space, with click ripples */
export const Cursor: React.FC<{ keys: Key[]; clicks: number[]; scale?: number }> = ({ keys, clicks, scale = 1 }) => {
  const f = useCurrentFrame();
  const { x, y } = cursorAt(keys, f);
  const press = clicks.some((c) => f >= c - 2 && f < c + 3);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, zIndex: 80, pointerEvents: "none" }}>
      {clicks.map((c) => {
        const p = interpolate(f, [c, c + 16], [0, 1], clamp);
        if (f < c || p >= 1) return null;
        return <span key={c} style={{ position: "absolute", left: x - 22 * scale, top: y - 22 * scale, width: 44 * scale, height: 44 * scale, borderRadius: "50%", border: `3px solid ${C.denim}`, opacity: 1 - p, transform: `scale(${0.3 + p * 1.1})` }} />;
      })}
      <svg width={30 * scale} height={34 * scale} viewBox="0 0 24 28" style={{ position: "absolute", left: x - 3 * scale, top: y - 2 * scale, transform: `scale(${press ? 0.85 : 1})`, transformOrigin: "3px 2px", filter: "drop-shadow(0 3px 4px rgba(0,0,0,.35))" }}>
        <path d="M3 2v20l5.4-5 3.6 8 3.4-1.5-3.6-7.8H20Z" fill="#fff" stroke={C.deep} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
