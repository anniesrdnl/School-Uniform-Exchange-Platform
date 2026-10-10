import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, LISTINGS, POLO, Photo, clamp, ease, fontFamily, prog, typed } from "./theme";
import { Background, Caption, Cursor, Headline, Key, Segment, Window, cursorAt, followCam } from "./Stage";
import { Confetti, Sfx } from "./Fx";
import { BrowseView, CARD_H, CARD_W, DetailView, GRID_TOP, HomeView, LogoTile, SearchState, SellView } from "./Site";

export type PromoProps = { useVoiceover: boolean };

/** Scene boundaries (frames @30fps) from the storyboard: 0:07, 0:15, 0:27, 0:39, 0:50 */
const S = { hook: 0, intro: 210, browse: 450, sell: 810, impact: 1170, cta: 1500, end: 1800 };
export const TOTAL = S.end;

const VO = {
  hook: "Got a school uniform you no longer use? Or need one without spending too much?",
  intro: "Introducing School Uniform Exchange, a smarter way for students to buy, sell, and exchange pre-loved uniforms.",
  browse: "Looking for an affordable uniform? Browse available listings, explore your options, and find what fits your needs and budget.",
  sell: "Have uniforms you no longer need? Give them a second life by listing them for other students to buy or exchange.",
  impact: "Because every uniform deserves another chance. Spend less, reduce clothing waste, and help fellow students along the way.",
  cta: "School Uniform Exchange. Making uniforms more affordable, accessible, and sustainable. Start exchanging today!",
};

/** Recorded voice-overs (public/vo/sceneN.mp3). Scenes without a recording keep their subtitles only. */
const VO_FILES: Record<number, { frames: number; at: number }> = {
  2: { frames: 234, at: 2 },
  3: { frames: 254, at: 10 },
  4: { frames: 275, at: 10 },
  5: { frames: 263, at: 10 },
  6: { frames: 225, at: 10 },
};
const sec = (s: number, at = 10) => Math.round(at + s * 30); // seconds into the recording -> scene frame

const VoiceTrack: React.FC<{ n: number; on: boolean }> = ({ n, on }) =>
  on && VO_FILES[n] ? (
    <Sequence from={VO_FILES[n].at} durationInFrames={VO_FILES[n].frames + 20} layout="none">
      <Audio src={staticFile(`vo/scene${n}.mp3`)} volume={1} />
    </Sequence>
  ) : null;

// Sentence timing measured from the recordings
// Scene 2: "Introducing School Uniform Exchange, a smarter way for students to buy, sell, and exchange pre-loved uniforms." (recording sped up 15% to fit the 8 s scene)
const INTRO_SEGS: Segment[] = [
  { text: "Introducing School", start: sec(0.1, 2), end: sec(0.88, 2) },
  { text: "Uniform Exchange,", start: sec(1.27, 2), end: sec(2.85, 2) },
  { text: "a smarter way for students to buy,", start: sec(3.1, 2), end: sec(4.85, 2) },
  { text: "sell,", start: sec(5.15, 2), end: sec(5.55, 2) },
  { text: "and exchange pre-loved uniforms.", start: sec(5.82, 2), end: sec(7.3, 2) },
];
// Scene 6: "School Uniform Exchange. Making uniforms more affordable, accessible, and sustainable. Start exchanging today!"
const CTA_SEGS: Segment[] = [
  { text: "School Uniform Exchange.", start: sec(0.18), end: sec(1.78) },
  { text: "Making uniforms more affordable,", start: sec(1.79), end: sec(3.74) },
  { text: "accessible, and sustainable.", start: sec(3.75), end: sec(5.4) },
  { text: "Start exchanging today!", start: sec(5.68), end: sec(7.0) },
];
const BROWSE_SEGS: Segment[] = [
  { text: "Looking for an affordable uniform?", start: sec(0.65), end: sec(2.49) },
  { text: "Browse available listings,", start: sec(2.75), end: sec(4.06) },
  { text: "explore your options,", start: sec(4.23), end: sec(5.5) },
  { text: "and find what fits your needs and budget.", start: sec(5.6), end: sec(7.53) },
];
const SELL_SEGS: Segment[] = [
  { text: "Have uniforms you no longer need?", start: sec(0.95), end: sec(3.7) },
  { text: "Give them a second life by listing them for other students to buy or exchange.", start: sec(4.1), end: sec(8.82) },
];
const IMPACT_SEGS: Segment[] = [
  { text: "Because every uniform deserves another chance.", start: sec(0.32), end: sec(2.92) },
  { text: "Spend less,", start: sec(3.32), end: sec(4.34) },
  { text: "reduce clothing waste,", start: sec(4.63), end: sec(5.6) },
  { text: "and help fellow students along the way.", start: sec(5.97), end: sec(8.2) },
];
// Global frame ranges where a voice-over plays, so the music can duck under them
const VO_RANGES = Object.entries(VO_FILES).map(([n, v]) => {
  const start = [S.hook, S.intro, S.browse, S.sell, S.impact, S.cta][Number(n) - 1] + v.at;
  return [start, start + v.frames] as const;
});

/* ------------------------------ 1. Hook ------------------------------ */
const Shirts: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {Array.from({ length: 12 }, (_, i) => {
        const r = (k: number) => random(`shirt-${i}-${k}`);
        const size = 70 + r(1) * 110;
        const y = 1250 - ((f * (1.2 + r(3) * 2.4) + r(4) * 1400) % 1400);
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth="0.7" strokeLinejoin="round" style={{ position: "absolute", left: r(2) * 1800, top: y, opacity: 0.07 + r(5) * 0.1, transform: `rotate(${Math.sin(f / 28 + i) * 16}deg)` }}>
            <path d="M8 3 3 6l2 4 2-1v11h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0Z" />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = [
    { t: "Old uniform?", at: 8, size: 132 },
    { t: "Still usable?", at: 62, size: 132 },
    { t: "Why let it go to waste?", at: 116, size: 112 },
  ];
  const drift = interpolate(f, [0, 210], [1.08, 1.18]);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background />
      <AbsoluteFill style={{ opacity: 0.2, filter: "blur(10px)", transform: `scale(${drift})` }}>
        <Photo crop={[0.5, 0.5, 1.5]} style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      <Shirts />
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, transparent 20%, ${C.deep}f2 85%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14, transform: `scale(${1 + f * 0.0004})` }}>
        {lines.map((l, i) => {
          const next = lines[i + 1];
          const dim = next ? interpolate(f, [next.at, next.at + 16], [1, 0.28], clamp) : 1;
          const strike = i === 2 ? prog(f, 150, 172) : 0;
          const shake = i === 2 && f > 150 && f < 176 ? Math.sin(f * 3) * (176 - f) * 0.12 : 0;
          return (
            <div key={i} style={{ position: "relative", fontSize: l.size, fontWeight: 800, letterSpacing: -3, color: C.white, opacity: dim, whiteSpace: "pre", transform: `translateX(${shake}px)` }}>
              {l.t.split("").map((ch, k) => {
                const p = spring({ frame: f - l.at - k * 1.1, fps, config: { damping: 13, stiffness: 150 } });
                return (
                  <span key={k} style={{ display: "inline-block", whiteSpace: "pre", opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 80}px) rotate(${(1 - p) * (k % 2 ? 10 : -10)}deg) scale(${0.6 + 0.4 * p})` }}>
                    {ch}
                  </span>
                );
              })}
              {i === 2 ? <span style={{ position: "absolute", left: "58%", bottom: 8, height: 8, width: `${strike * 30}%`, borderRadius: 4, background: C.cream }} /> : null}
            </div>
          );
        })}
      </AbsoluteFill>
      <Caption text={VO.hook} to={185} duration={S.intro - S.hook} />
      <Sfx at={8} name="pop" volume={0.5} />
      <Sfx at={62} name="pop" volume={0.5} />
      <Sfx at={116} name="pop" volume={0.5} />
      <Sfx at={152} name="thud" volume={0.5} />
    </AbsoluteFill>
  );
};

/* ------------------------------ 2. Introduction ------------------------------ */
const introKeys: Key[] = [
  { f: 0, x: 1000, y: 560 },
  { f: 40, x: 64, y: 34 },
  { f: 70, x: 64, y: 34 },
  { f: 98, x: 330, y: 150 },
  { f: 118, x: 348, y: 304 },
  { f: 178, x: 360, y: 304 },
  { f: 196, x: 300, y: 368 },
  { f: 240, x: 300, y: 368 },
];
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [10, 100], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const down = interpolate(f, [130, 170], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cam = { s: 1 + 0.5 * z, x: 0, y: -110 * down };
  const cur = cursorAt(introKeys, f);
  const wiggle = interpolate(f, [38, 46, 56, 66], [0, 1, 1, 0], clamp);
  const hoverRow = cur.x > 88 && cur.x < 608 && cur.y > 342 && cur.y < 498 ? Math.floor((cur.y - 342) / 52) : -1;
  const search: SearchState = {
    text: typed("polo", f, 132, 0.25),
    focus: f >= 124,
    open: prog(f, 152, 166),
    hover: hoverRow,
    picked: f >= 200,
  };
  return (
    <AbsoluteFill>
      <Background />
      <Headline words={[{ t: "Introducing School Uniform Exchange", at: 10 }]} size={46} />
      <Window cam={cam} delay={4}>
        <HomeView f={f} wiggle={wiggle} search={search} />
        <Cursor keys={introKeys} clicks={[124, 200]} />
      </Window>
      <Caption text={VO.intro} from={INTRO_SEGS[0].start - 4} to={200} duration={S.browse - S.intro} segments={INTRO_SEGS} />
      <Sfx at={124} name="click" />
      <Sfx at={132} name="typing" dur={22} volume={0.5} />
      <Sfx at={152} name="tick" />
      <Sfx at={200} name="click" />
      <Sfx at={44} name="pop" volume={0.35} />
    </AbsoluteFill>
  );
};

/* ------------------------------ 3. Browse ------------------------------ */
const CARD_X = 40 + (CARD_W + 16) + CARD_W / 2;
const CARD_Y = GRID_TOP + (CARD_H + 16) - 330 + CARD_W / 2;
const browseKeys: Key[] = [
  { f: 0, x: 900, y: 520 },
  { f: 44, x: 671, y: 102 },
  { f: 70, x: 722, y: 195 },
  { f: 100, x: 700, y: 300 },
  { f: 196, x: CARD_X, y: CARD_Y },
  { f: 222, x: 620, y: 300 },
  { f: 240, x: 502, y: 160 },
  { f: 262, x: 910, y: 459 },
  { f: 318, x: 910, y: 524 },
  { f: 350, x: 1000, y: 600 },
];
const browseClicks = [50, 78, 208, 246, 272, 326];
const browseScroll = (f: number) => interpolate(f, [112, 190], [0, 330], { ...clamp, easing: Easing.inOut(Easing.cubic) });
const Browse: React.FC = () => {
  const f = useCurrentFrame();
  const detail = prog(f, 212, 228);
  const cam = followCam(browseKeys, browseClicks, f, 0.05);
  return (
    <AbsoluteFill>
      <Background />
      <Headline words={[{ t: "Browse.", at: 14 }, { t: "Discover.", at: 100 }, { t: "Save.", at: 230 }]} />
      <Window delay={4} cam={cam}>
        <BrowseView f={f} scrollAt={browseScroll} curAt={(x) => cursorAt(browseKeys, x)} menuAt={50} filterAt={78} />
        <div style={{ position: "absolute", inset: 0, zIndex: 20, background: C.white, opacity: detail, transform: `scale(${1.05 - 0.05 * detail})`, transformOrigin: "40% 50%", display: detail > 0 ? "block" : "none" }}>
          <DetailView f={f - 212} heartAt={34} msgAt={60} typeAt={64} sentAt={116} />
        </div>
        <Cursor keys={browseKeys} clicks={browseClicks} />
        <Confetti at={328} x={910} y={524} n={55} seed={4} />
      </Window>
      <Caption text={VO.browse} from={BROWSE_SEGS[0].start - 8} to={310} duration={S.sell - S.browse} segments={BROWSE_SEGS} />
      {browseClicks.map((c) => <Sfx key={c} at={c} name="click" />)}
      <Sfx at={246} name="pop" />
      <Sfx at={276} name="typing" dur={42} volume={0.5} />
      <Sfx at={326} name="chime" volume={0.6} />
      <Sfx at={52} name="tick" />
    </AbsoluteFill>
  );
};

/* ------------------------------ 4. Sell / exchange ------------------------------ */
const scroll4 = (f: number) => interpolate(f, [105, 140, 180, 205], [0, 200, 200, 320], { ...clamp, easing: ease });
const sy = (cy: number, at: number) => 84 + cy - scroll4(at);
const sellKeys: Key[] = [
  { f: 0, x: 1150, y: 420 },
  { f: 8, x: 1150, y: 420 },
  { f: 38, x: 420, y: sy(111, 38) },
  { f: 52, x: 420, y: sy(306, 52) },
  { f: 100, x: 700, y: 420 },
  { f: 148, x: 147, y: sy(388, 148) },
  { f: 160, x: 244, y: sy(468, 160) },
  { f: 172, x: 323, y: sy(548, 172) },
  { f: 210, x: 639, y: sy(772, 210) },
  { f: 226, x: 164, y: sy(844, 226) },
  { f: 262, x: 1035, y: 600 },
  { f: 300, x: 1100, y: 500 },
];
const sellClicks = [56, 152, 164, 176, 214, 228, 268];
const Sell: React.FC = () => {
  const f = useCurrentFrame();
  const cur = cursorAt(sellKeys, f);
  const cam = followCam(sellKeys, sellClicks, f, 0.05);
  const ghost = f < 44 ? interpolate(f, [38, 44], [1, 0], clamp) : 0;
  return (
    <AbsoluteFill>
      <Background />
      <Headline words={[{ t: "List it.", at: 14 }, { t: "Sell it.", at: 120 }, { t: "Exchange it.", at: 205 }]} />
      <Window delay={4} cam={cam}>
        <SellView f={f} scroll={scroll4(f)} />
        {ghost > 0 ? (
          <div style={{ position: "absolute", left: cur.x - 30, top: cur.y - 30, zIndex: 70, width: 96, padding: 5, borderRadius: 12, background: C.white, boxShadow: `0 18px 30px ${C.deep}66`, transform: `rotate(${-7 * ghost}deg) scale(${ghost})` }}>
            <Photo crop={POLO.crop} style={{ width: 86, height: 70, borderRadius: 8 }} />
            <div style={{ fontSize: 9, fontWeight: 600, color: C.s500, paddingTop: 3, textAlign: "center" }}>IMG_2041.jpg</div>
          </div>
        ) : null}
        <Cursor keys={sellKeys} clicks={sellClicks} />
        <Confetti at={268} x={1035} y={590} n={80} seed={9} power={1.1} />
      </Window>
      <Caption text={VO.sell} from={SELL_SEGS[0].start - 8} to={320} duration={S.impact - S.sell} segments={SELL_SEGS} />
      <Sfx at={38} name="thud" volume={0.6} />
      {sellClicks.map((c) => <Sfx key={c} at={c} name="click" />)}
      <Sfx at={58} name="typing" dur={64} volume={0.5} />
      <Sfx at={232} name="typing" dur={14} volume={0.5} />
      <Sfx at={270} name="chime" volume={0.65} />
    </AbsoluteFill>
  );
};

/* ------------------------------ 5. Impact ------------------------------ */
const Icon: React.FC<{ kind: "savings" | "waste" | "students"; p: number; f: number; since: number }> = ({ kind, p, f, since }) => {
  const off = 1 - p;
  const done = p >= 1;
  const common = { fill: "none", stroke: C.white, strokeWidth: 4.5, strokeLinecap: "round", strokeLinejoin: "round", pathLength: 1, strokeDasharray: 1, strokeDashoffset: off } as const;
  const boost = since >= 0 ? Math.max(0, 1 - since / 30) : 0;
  return (
    <svg width="190" height="190" viewBox="0 0 120 120" style={{ overflow: "visible" }}>
      {kind === "savings" && (
        <>
          <g transform={`translate(60 62) scale(${done ? Math.max(0.12, Math.abs(Math.cos(f / 16 + boost * 6))) : 1} 1) translate(-60 -62)`}>
            <circle cx="60" cy="62" r="40" {...common} />
            <circle cx="60" cy="62" r="30" {...common} strokeWidth={2} opacity={0.6} />
            <text x="60" y="76" textAnchor="middle" fontSize="40" fontWeight="700" fill={C.white} opacity={interpolate(p, [0.6, 1], [0, 1], clamp)} fontFamily={fontFamily}>₱</text>
          </g>
          {done ? [0, 1, 2].map((j) => {
            const t = ((f + j * 24) % 72) / 72;
            return <text key={j} x={92 + j * 6} y={40 - t * 46} fontSize="14" fontWeight="700" fill={C.white} opacity={Math.sin(t * Math.PI)} fontFamily={fontFamily}>+</text>;
          }) : <path d="M92 14v18M83 23h18" {...common} strokeWidth={3.5} />}
        </>
      )}
      {kind === "waste" && (
        <>
          <g transform={`rotate(${Math.sin(f / 15) * 6} 60 60)`}>
            <path d="M22 88C18 48 48 20 98 20c2 42-16 74-62 70Z" {...common} />
            <path d="M26 96 66 54" {...common} />
            <path d="M60 60h22M50 70h18" {...common} strokeWidth={3} />
          </g>
          {done ? <circle cx="60" cy="60" r="64" fill="none" stroke={C.white} strokeWidth="3" strokeLinecap="round" strokeDasharray="14 22" opacity={0.65} transform={`rotate(${f * (2 + boost * 8)} 60 60)`} /> : null}
        </>
      )}
      {kind === "students" && (
        <>
          <g transform={`translate(0 ${done ? Math.sin(f / 9) * 3 : 0})`}><circle cx="60" cy="38" r="14" {...common} /><path d="M32 98c0-20 12-32 28-32s28 12 28 32" {...common} /></g>
          <g transform={`translate(0 ${done ? Math.sin(f / 9 + 2) * 3 : 0})`}><circle cx="22" cy="54" r="9" {...common} strokeWidth={3.5} /><path d="M6 94c0-12 7-20 16-20" {...common} strokeWidth={3.5} /></g>
          <g transform={`translate(0 ${done ? Math.sin(f / 9 + 4) * 3 : 0})`}><circle cx="98" cy="54" r="9" {...common} strokeWidth={3.5} /><path d="M114 94c0-12-7-20-16-20" {...common} strokeWidth={3.5} /></g>
          {done ? [0, 1].map((j) => {
            const t = ((f + j * 30) % 60) / 60;
            return <path key={j} transform={`translate(${44 + j * 22} ${14 - t * 30}) scale(0.5)`} d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" fill={C.white} opacity={Math.sin(t * Math.PI)} />;
          }) : null}
        </>
      )}
    </svg>
  );
};

const impactKeys: Key[] = [
  { f: 0, x: 1250, y: 940 },
  { f: 150, x: 404, y: 620 },
  { f: 184, x: 960, y: 620 },
  { f: 222, x: 1516, y: 620 },
  { f: 290, x: 1700, y: 900 },
];
const impactClicks = [160, 194, 236];
const Impact: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = [
    { kind: "savings" as const, t: "Savings", s: "Pre-loved costs a fraction of new", at: 112 },
    { kind: "waste" as const, t: "Sustainability", s: "Every reuse keeps clothing out of landfill", at: 146 },
    { kind: "students" as const, t: "Community", s: "Uniforms passed to classmates who need them", at: 180 },
  ];
  const blur = interpolate(f, [0, 24], [0, 16], clamp);
  const cur = cursorAt(impactKeys, f);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background />
      {/* frozen + blurred site recording */}
      <AbsoluteFill style={{ filter: `blur(${blur}px)`, opacity: 0.55 }}>
        <div style={{ width: 1280, height: 680, transformOrigin: "0 0", transform: "scale(1.5)" }}>
          <BrowseView f={400} scrollAt={() => 330} curAt={() => ({ x: -999, y: -999 })} menuAt={9999} filterAt={9999} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.deep}cc, ${C.navy}bb)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", fontSize: 92, fontWeight: 800, letterSpacing: -2, color: C.white, opacity: prog(f, 14, 34) * (1 - prog(f, 92, 108)), transform: `translateY(${(1 - prog(f, 14, 34)) * 40 - prog(f, 92, 108) * 30}px)` }}>
        Every uniform deserves
        <br />
        <span style={{ color: C.cream }}>another chance.</span>
      </div>
      <Headline
        top={70}
        size={50}
        words={[{ t: "Save Money", at: 112 }, { t: "•", at: 130 }, { t: "Reduce Waste", at: 146 }, { t: "•", at: 164 }, { t: "Help Students", at: 180 }]}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center", gap: 56 }}>
        {cards.map((c, i) => {
          const sp = spring({ frame: f - c.at, fps, config: { damping: 14, stiffness: 110 } });
          const draw = prog(f, c.at + 6, c.at + 40);
          const pulse = ((f - c.at) % 70) / 70;
          const centre = 404 + 556 * i;
          const hover = cur.y > 290 && cur.y < 810 ? Math.max(0, 1 - Math.abs(cur.x - centre) / 300) : 0;
          const since = f - impactClicks[i];
          const clickPop = since >= 0 && since < 14 ? Math.sin((since / 14) * Math.PI) * 0.05 : 0;
          return (
            <div key={c.t} style={{ width: 500, height: 520, borderRadius: 36, background: `linear-gradient(160deg, rgba(255,255,255,${0.17 + 0.12 * hover}), rgba(255,255,255,${0.06 + 0.06 * hover}))`, boxShadow: `inset 0 0 0 ${1.5 + hover}px rgba(255,255,255,${0.25 + 0.3 * hover}), 0 ${30 + 20 * hover}px ${60 + 30 * hover}px rgba(0,0,0,.35)`, backdropFilter: "blur(10px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, opacity: Math.min(1, sp * 1.5), transform: `translateY(${(1 - sp) * 120 + Math.sin(f / 30 + i * 2) * 6 - 14 * hover}px) scale(${0.8 + 0.2 * sp + 0.04 * hover + clickPop})` }}>
              <div style={{ position: "relative", width: 250, height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `${C.denim}66` }} />
                {f >= c.at ? <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(255,255,255,.5)", opacity: 1 - pulse, transform: `scale(${1 + pulse * 0.5})` }} /> : null}
                <Icon kind={c.kind} p={draw} f={f} since={since} />
              </div>
              <div style={{ fontSize: 46, fontWeight: 800, color: C.white, letterSpacing: -1 }}>{c.t}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: C.cream, textAlign: "center", width: 360, lineHeight: 1.35 }}>{c.s}</div>
            </div>
          );
        })}
      </div>
      {impactClicks.map((c, i) => <Confetti key={c} at={c} x={404 + 556 * i} y={420} n={26} seed={20 + i} power={0.7} size={0.8} />)}
      <Cursor keys={impactKeys} clicks={impactClicks} scale={1.4} />
      <Caption text={VO.impact} from={IMPACT_SEGS[0].start - 8} to={290} duration={S.cta - S.impact} segments={IMPACT_SEGS} />
      {impactClicks.map((c) => <Sfx key={c} at={c} name="click" />)}
      {[112, 146, 180].map((c) => <Sfx key={c} at={c} name="pop" volume={0.4} />)}
      {impactClicks.map((c) => <Sfx key={`c${c}`} at={c + 2} name="tick" volume={0.5} />)}
    </AbsoluteFill>
  );
};

/* ------------------------------ 6. Call to action ------------------------------ */
const Closing: React.FC = () => {
  const f = useCurrentFrame() - 96; // starts when the circular reveal is nearly open
  const { fps } = useVideoConfig();
  const logo = spring({ frame: f - 6, fps, config: { damping: 12, stiffness: 100 } });
  const t = (a: number) => prog(f, a, a + 18);
  const press = f >= 128 && f < 136 ? 0.94 : 1;
  const sheen = interpolate(f, [30, 60], [-120, 260], clamp);
  const minis: [number, number, number, number][] = [[110, 190, -8, 0], [250, 420, 6, 1], [100, 650, 5, 2], [1650, 170, 8, 3], [1520, 400, -6, 4], [1690, 640, -9, 5]];
  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Background />
      {minis.map(([x, y, rot, k]) => {
        const sp = spring({ frame: f - 14 - k * 6, fps, config: { damping: 14 } });
        const l = LISTINGS[(k * 2 + 1) % LISTINGS.length];
        return (
          <div key={k} style={{ position: "absolute", left: x, top: y + Math.sin(f / 24 + k) * 10, width: 150, padding: 7, borderRadius: 18, background: C.white, boxShadow: `0 20px 40px ${C.deep}88`, opacity: sp * 0.95, transform: `scale(${sp}) rotate(${rot + Math.sin(f / 30 + k) * 2}deg)` }}>
            <Photo crop={l.crop} style={{ width: 136, height: 136, borderRadius: 12 }} />
            <div style={{ padding: "6px 4px 0", fontSize: 14, fontWeight: 700, color: C.navy }}>₱{l.price}</div>
          </div>
        );
      })}
      <div style={{ transform: `scale(${logo}) rotate(${(1 - logo) * -25}deg)`, marginTop: -90, position: "relative", overflow: "hidden", borderRadius: 54 }}>
        <LogoTile size={190} />
        <span style={{ position: "absolute", top: 0, bottom: 0, left: sheen, width: 60, background: "linear-gradient(100deg, transparent, rgba(255,255,255,.45), transparent)", transform: "skewX(-20deg)" }} />
      </div>
      <div style={{ marginTop: 34, fontSize: 82, fontWeight: 800, color: C.white, letterSpacing: -2, opacity: t(16), transform: `translateY(${(1 - t(16)) * 30}px)` }}>School Uniform Exchange</div>
      <div style={{ marginTop: 8, fontSize: 46, fontWeight: 600, color: C.cream, opacity: t(34), transform: `translateY(${(1 - t(34)) * 30}px)` }}>Your Uniform. Their Opportunity.</div>
      <div style={{ marginTop: 36, padding: "16px 40px", borderRadius: 999, background: C.white, color: C.navy, fontSize: 34, fontWeight: 700, opacity: t(56), transform: `translateY(${(1 - t(56)) * 30}px)`, boxShadow: "0 18px 40px rgba(0,0,0,.35)" }}>
        school-uniform-exchange-platform.vercel.app
      </div>
      <div style={{ marginTop: 30, height: 76, minWidth: 560, justifyContent: "center", padding: "0 46px", borderRadius: 20, background: f >= 130 ? C.cream : C.navy, color: f >= 130 ? C.navy : C.white, boxShadow: f >= 130 ? "0 0 0 0 transparent" : `0 0 0 ${3 + ((f % 40) / 40) * 14}px rgba(255,255,255,${0.35 * (1 - (f % 40) / 40)}), inset 0 0 0 2px rgba(255,255,255,.5)`, fontSize: 32, fontWeight: 700, display: "flex", alignItems: "center", opacity: t(78), transform: `translateY(${(1 - t(78)) * 30}px) scale(${press})` }}>
        {f >= 130 ? "✓ Let's go!" : "Start exchanging today! →"}
      </div>
    </AbsoluteFill>
  );
};

const ctaKeys: Key[] = [
  { f: 0, x: 1400, y: 640 },
  { f: 80, x: 1100, y: 560 },
  { f: 110, x: 1100, y: 560 },
  { f: 160, x: 1250, y: 880 },
  { f: 218, x: 960, y: 786 },
  { f: 300, x: 1000, y: 880 },
];
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const reveal = interpolate(f, [92, 130], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const zoom = interpolate(f, [0, 100], [1.06, 1], clamp);
  return (
    <AbsoluteFill>
      <Background />
      <Headline words={[{ t: "Your Uniform. Their Opportunity.", at: 40 }]} size={46} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})` }}>
        <Window delay={0}>
          <HomeView f={f} />
        </Window>
      </div>
      <AbsoluteFill style={{ clipPath: `circle(${reveal * 1300}px at 50% 50%)` }}>
        <Closing />
      </AbsoluteFill>
      <Confetti at={118} x={960} y={420} n={70} seed={31} power={1.3} />
      <Confetti at={226} x={960} y={780} n={110} seed={32} power={1.5} />
      <Cursor keys={ctaKeys} clicks={[226]} scale={1.5} />
      <Caption text={VO.cta} from={CTA_SEGS[0].start - 8} to={250} duration={S.end - S.cta} segments={CTA_SEGS} />
      <Sfx at={226} name="click" />
      <Sfx at={228} name="chime" volume={0.7} />
      <Sfx at={110} name="chime" volume={0.4} />
    </AbsoluteFill>
  );
};

/* ------------------------------ Transitions ------------------------------ */
const Wipe: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at - 14, at + 14], [0, 2], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  if (p <= 0 || p >= 2) return null;
  const x = p < 1 ? -2120 + p * 2120 : (p - 1) * 2120;
  const logo = interpolate(p, [0.7, 1, 1.3], [0, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: 0, width: 2120, height: 1080, background: `linear-gradient(100deg, ${C.deep}, ${C.navy})`, clipPath: "polygon(0 0, 100% 0, calc(100% - 200px) 100%, 0 100%)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ opacity: logo, transform: `scale(${0.8 + 0.2 * logo})`, marginRight: 200 }}>
        <LogoTile size={140} />
      </div>
    </div>
  );
};

/* ------------------------------ Root composition ------------------------------ */
export const Promo: React.FC<PromoProps> = ({ useVoiceover }) => {
  const scenes: [number, number, React.FC][] = [
    [S.hook, S.intro, Hook],
    [S.intro, S.browse, Intro],
    [S.browse, S.sell, Browse],
    [S.sell, S.impact, Sell],
    [S.impact, S.cta, Impact],
    [S.cta, S.end, Cta],
  ];
  return (
    <AbsoluteFill style={{ background: C.deep }}>
      {scenes.map(([from, to, Scene], i) => (
        <Sequence key={i} from={from} durationInFrames={to - from} name={`Scene ${i + 1}`}>
          <Scene />
          <VoiceTrack n={i + 1} on={useVoiceover} />
        </Sequence>
      ))}
      {[S.intro, S.browse, S.sell, S.impact, S.cta].map((b) => (
        <Wipe key={b} at={b} />
      ))}
      <Audio
        src={staticFile("music.mp3")}
        volume={(f) => {
          const duck = VO_RANGES.reduce((m, [a, b]) => Math.max(m, useVoiceover ? interpolate(f, [a - 12, a + 6, b, b + 20], [0, 1, 1, 0], clamp) : 0), 0);
          return 0.6 * (1 - 0.7 * duck) * interpolate(f, [0, 20, TOTAL - 60, TOTAL], [0, 1, 1, 0], clamp);
        }}
      />
    </AbsoluteFill>
  );
};
