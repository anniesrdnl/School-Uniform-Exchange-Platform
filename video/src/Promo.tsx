import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, Photo, clamp, ease, fontFamily, prog } from "./theme";
import { Background, Caption, Cursor, Headline, Key, Window } from "./Stage";
import { BrowseView, CARD_H, CARD_W, DetailView, GRID_TOP, HomeView, LogoTile, SellView } from "./Site";

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

const VoiceTrack: React.FC<{ n: number; on: boolean }> = ({ n, on }) => (on ? <Audio src={staticFile(`vo/scene${n}.mp3`)} /> : null);

/* ------------------------------ 1. Hook ------------------------------ */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
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
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, transparent 20%, ${C.deep}f2 85%)` }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
        {lines.map((l, i) => {
          const p = prog(f, l.at, l.at + 20);
          const next = lines[i + 1];
          const dim = next ? interpolate(f, [next.at, next.at + 16], [1, 0.28], clamp) : 1;
          const strike = i === 2 ? prog(f, 150, 172) : 0;
          return (
            <div key={i} style={{ position: "relative", fontSize: l.size, fontWeight: 800, letterSpacing: -3, color: C.white, opacity: p * dim, transform: `translateY(${(1 - p) * 60}px)`, clipPath: `inset(-20% -5% ${(1 - p) * 60}% -5%)` }}>
              {l.t}
              {i === 2 ? (
                <span style={{ position: "absolute", left: "58%", bottom: 8, height: 8, width: `${strike * 30}%`, borderRadius: 4, background: C.cream }} />
              ) : null}
            </div>
          );
        })}
      </AbsoluteFill>
      <Caption text={VO.hook} to={185} duration={S.intro - S.hook} />
    </AbsoluteFill>
  );
};

/* ------------------------------ 2. Introduction ------------------------------ */
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [40, 215], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const cam = { s: 1 + 0.75 * z, x: 0, y: -4 * z };
  return (
    <AbsoluteFill>
      <Background />
      <Headline words={[{ t: "Introducing School Uniform Exchange", at: 10 }]} size={46} />
      <Window cam={cam} delay={4}>
        <HomeView f={f} />
      </Window>
      <Caption text={VO.intro} to={200} duration={S.browse - S.intro} />
    </AbsoluteFill>
  );
};

/* ------------------------------ 3. Browse ------------------------------ */
const Browse: React.FC = () => {
  const f = useCurrentFrame();
  const scroll = interpolate(f, [40, 140], [0, 330], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const hoverIdx = 5;
  const hoverAmt = interpolate(f, [178, 190, 197], [0, 1, 1], clamp);
  const cardX = 40 + (CARD_W + 16) + CARD_W / 2;
  const cardY = GRID_TOP + (CARD_H + 16) - 330 + CARD_W / 2;
  const detail = prog(f, 198, 214);
  const keys: Key[] = [
    { f: 0, x: 900, y: 520 },
    { f: 60, x: 760, y: 430 },
    { f: 185, x: cardX, y: cardY },
    { f: 262, x: 520, y: 330 },
    { f: 276, x: 502, y: 160 },
    { f: 320, x: 700, y: 430 },
  ];
  return (
    <AbsoluteFill>
      <Background />
      <Headline words={[{ t: "Browse.", at: 14 }, { t: "Discover.", at: 100 }, { t: "Save.", at: 235 }]} />
      <Window delay={4}>
        <BrowseView scroll={scroll} hover={f < 198 ? hoverIdx : -1} hoverAmt={hoverAmt} />
        <div style={{ position: "absolute", inset: 0, zIndex: 20, background: C.white, opacity: detail, transform: `scale(${1.05 - 0.05 * detail})`, transformOrigin: "40% 50%" }}>
          <DetailView f={f - 198} saveAt={82} />
        </div>
        <Cursor keys={keys} clicks={[192, 280]} />
      </Window>
      <Caption text={VO.browse} to={310} duration={S.sell - S.browse} />
    </AbsoluteFill>
  );
};

/* ------------------------------ 4. Sell / exchange ------------------------------ */
const scroll4 = (f: number) => interpolate(f, [105, 140, 180, 205], [0, 200, 200, 320], { ...clamp, easing: ease });
const Sell: React.FC = () => {
  const f = useCurrentFrame();
  const sy = (cy: number, at: number) => 84 + cy - scroll4(at);
  const keys: Key[] = [
    { f: 0, x: 900, y: 500 },
    { f: 26, x: 420, y: sy(111, 26) },
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
  return (
    <AbsoluteFill>
      <Background />
      <Headline words={[{ t: "List it.", at: 14 }, { t: "Sell it.", at: 120 }, { t: "Exchange it.", at: 205 }]} />
      <Window delay={4}>
        <SellView f={f} scroll={scroll4(f)} />
        <Cursor keys={keys} clicks={[30, 56, 152, 164, 176, 214, 228, 268]} />
      </Window>
      <Caption text={VO.sell} to={320} duration={S.impact - S.sell} />
    </AbsoluteFill>
  );
};

/* ------------------------------ 5. Impact ------------------------------ */
const Icon: React.FC<{ kind: "savings" | "waste" | "students"; p: number }> = ({ kind, p }) => {
  const off = 1 - p;
  const common = { fill: "none", stroke: C.white, strokeWidth: 4.5, strokeLinecap: "round", strokeLinejoin: "round", pathLength: 1, strokeDasharray: 1, strokeDashoffset: off } as const;
  return (
    <svg width="190" height="190" viewBox="0 0 120 120">
      {kind === "savings" && (
        <>
          <circle cx="60" cy="62" r="40" {...common} />
          <circle cx="60" cy="62" r="30" {...common} strokeWidth={2} opacity={0.6} />
          <text x="60" y="76" textAnchor="middle" fontSize="40" fontWeight="700" fill={C.white} opacity={interpolate(p, [0.6, 1], [0, 1], clamp)} fontFamily={fontFamily}>₱</text>
          <path d="M92 14v18M83 23h18" {...common} strokeWidth={3.5} />
        </>
      )}
      {kind === "waste" && (
        <>
          <path d="M22 88C18 48 48 20 98 20c2 42-16 74-62 70Z" {...common} />
          <path d="M26 96 66 54" {...common} />
          <path d="M60 60h22M50 70h18" {...common} strokeWidth={3} />
        </>
      )}
      {kind === "students" && (
        <>
          <circle cx="60" cy="38" r="14" {...common} />
          <path d="M32 98c0-20 12-32 28-32s28 12 28 32" {...common} />
          <circle cx="22" cy="54" r="9" {...common} strokeWidth={3.5} />
          <circle cx="98" cy="54" r="9" {...common} strokeWidth={3.5} />
          <path d="M6 94c0-12 7-20 16-20M114 94c0-12-7-20-16-20" {...common} strokeWidth={3.5} />
        </>
      )}
    </svg>
  );
};

const Impact: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = [
    { kind: "savings" as const, t: "Savings", s: "Pre-loved costs a fraction of new", at: 24 },
    { kind: "waste" as const, t: "Sustainability", s: "Every reuse keeps clothing out of landfill", at: 84 },
    { kind: "students" as const, t: "Community", s: "Uniforms passed to classmates who need them", at: 144 },
  ];
  const blur = interpolate(f, [0, 24], [0, 16], clamp);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Background />
      {/* frozen + blurred site recording */}
      <AbsoluteFill style={{ filter: `blur(${blur}px)`, opacity: 0.55 }}>
        <div style={{ width: 1280, height: 680, transformOrigin: "0 0", transform: "scale(1.5)" }}>
          <BrowseView scroll={330} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.deep}cc, ${C.navy}bb)` }} />
      <Headline
        top={70}
        size={50}
        words={[{ t: "Save Money", at: 24 }, { t: "•", at: 60 }, { t: "Reduce Waste", at: 84 }, { t: "•", at: 120 }, { t: "Help Students", at: 144 }]}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, display: "flex", justifyContent: "center", gap: 56 }}>
        {cards.map((c, i) => {
          const sp = spring({ frame: f - c.at, fps, config: { damping: 14, stiffness: 110 } });
          const draw = prog(f, c.at + 6, c.at + 40);
          const pulse = ((f - c.at) % 70) / 70;
          return (
            <div key={c.t} style={{ width: 500, height: 520, borderRadius: 36, background: "linear-gradient(160deg, rgba(255,255,255,.17), rgba(255,255,255,.06))", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.25), 0 30px 60px rgba(0,0,0,.35)", backdropFilter: "blur(10px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, opacity: Math.min(1, sp * 1.5), transform: `translateY(${(1 - sp) * 120 + Math.sin(f / 30 + i * 2) * 6}px) scale(${0.8 + 0.2 * sp})` }}>
              <div style={{ position: "relative", width: 250, height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `${C.denim}66` }} />
                {f >= c.at ? <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(255,255,255,.5)", opacity: 1 - pulse, transform: `scale(${1 + pulse * 0.5})` }} /> : null}
                <Icon kind={c.kind} p={draw} />
              </div>
              <div style={{ fontSize: 46, fontWeight: 800, color: C.white, letterSpacing: -1 }}>{c.t}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: C.cream, textAlign: "center", width: 360, lineHeight: 1.35 }}>{c.s}</div>
            </div>
          );
        })}
      </div>
      <Caption text={VO.impact} to={290} duration={S.cta - S.impact} />
    </AbsoluteFill>
  );
};

/* ------------------------------ 6. Call to action ------------------------------ */
const Closing: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: f - 6, fps, config: { damping: 12, stiffness: 100 } });
  const t = (a: number) => prog(f, a, a + 18);
  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <Background />
      <div style={{ transform: `scale(${logo}) rotate(${(1 - logo) * -25}deg)`, marginTop: -90 }}>
        <LogoTile size={190} />
      </div>
      <div style={{ marginTop: 34, fontSize: 82, fontWeight: 800, color: C.white, letterSpacing: -2, opacity: t(16), transform: `translateY(${(1 - t(16)) * 30}px)` }}>School Uniform Exchange</div>
      <div style={{ marginTop: 8, fontSize: 46, fontWeight: 600, color: C.cream, opacity: t(34), transform: `translateY(${(1 - t(34)) * 30}px)` }}>Your Uniform. Their Opportunity.</div>
      <div style={{ marginTop: 36, padding: "16px 40px", borderRadius: 999, background: C.white, color: C.navy, fontSize: 34, fontWeight: 700, opacity: t(56), transform: `translateY(${(1 - t(56)) * 30}px) scale(${1 + Math.max(0, Math.sin((f - 80) / 10)) * 0.02})`, boxShadow: "0 18px 40px rgba(0,0,0,.35)" }}>
        school-uniform-exchange-platform.vercel.app
      </div>
    </AbsoluteFill>
  );
};

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
      <Caption text={VO.cta} to={250} duration={S.end - S.cta} />
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
          const base = useVoiceover ? 0.22 : 0.6;
          return base * interpolate(f, [0, 20, TOTAL - 60, TOTAL], [0, 1, 1, 0], clamp);
        }}
      />
    </AbsoluteFill>
  );
};
