import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { C, Listing, LISTINGS, Photo, POLO, clamp, ease, prog, typed } from "./theme";

type Pt = { x: number; y: number };

/* Faithful mock-ups of the real pages (client/src/pages/*). Each view is laid out in a 1280x680 viewport. */

export const LogoTile: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 40, style }) => (
  <div
    style={{
      ...style,
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: `linear-gradient(135deg, #264a71, ${C.deep})`,
      boxShadow: `0 6px 16px ${C.navy}40`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <Img
      src={staticFile("logo-white.png")}
      style={{ width: size * 0.78, height: size * 0.78, objectFit: "contain", }}
    />
  </div>
);

const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 22 }) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: C.aqua,
      color: C.navy,
      fontSize: size * 0.45,
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {name[0]}
  </span>
);

export const Navbar: React.FC<{ active: string; wiggle?: number }> = ({ active, wiggle = 0 }) => (
  <div
    style={{
      height: 64,
      background: C.white,
      borderBottom: `1px solid ${C.aqua}`,
      display: "flex",
      alignItems: "center",
      padding: "0 40px",
      gap: 10,
      position: "relative",
      zIndex: 5,
    }}
  >
    <LogoTile style={{ transform: `rotate(${-10 * wiggle}deg) scale(${1 + 0.14 * wiggle})` }} />
    <div style={{ marginLeft: 4, lineHeight: 1.15 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, letterSpacing: -0.2 }}>School Uniform Exchange Platform</div>
      <div style={{ fontSize: 11, fontWeight: 500, color: C.s500 }}>Exchange • Reuse • Support students</div>
    </div>
    <div style={{ flex: 1 }} />
    {["Home", "Browse", "Messages", "Profile"].map((l) => (
      <span
        key={l}
        style={{
          padding: "7px 14px",
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          background: l === active ? C.aqua : "transparent",
          color: l === active ? C.navy : C.s500,
        }}
      >
        {l}
      </span>
    ))}
    <span style={{ padding: "9px 18px", borderRadius: 12, background: C.navy, color: C.white, fontSize: 14, fontWeight: 600, marginLeft: 6 }}>
      + Sell
    </span>
    <Avatar name="Maria" size={34} />
  </div>
);

const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      background: "rgba(255,255,255,.95)",
      color: C.navy,
      ...style,
    }}
  >
    {children}
  </span>
);

export const ListingCard: React.FC<{ l: Listing; w: number; lift?: number }> = ({ l, w, lift = 0 }) => (
  <div
    style={{
      width: w,
      borderRadius: 16,
      background: C.white,
      border: `1px solid ${lift ? C.powder : C.aqua}`,
      overflow: "hidden",
      transform: `translateY(${-6 * lift}px)`,
      boxShadow: `0 ${4 + 14 * lift}px ${12 + 18 * lift}px ${C.navy}${lift ? "26" : "0d"}`,
    }}
  >
    <div style={{ position: "relative", width: w, height: w, overflow: "hidden" }}>
      <Photo crop={l.crop} style={{ width: "100%", height: "100%", transform: `scale(${1 + 0.05 * lift})` }} />
      <Chip style={{ position: "absolute", left: 8, top: 8 }}>{l.cond}</Chip>
    </div>
    <div style={{ padding: "10px 12px 12px" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</div>
      <div style={{ fontSize: 12, color: C.s500, marginTop: 2 }}>
        Size {l.size} · {l.cat}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>₱{l.price}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.s500 }}>
          <Avatar name={l.seller} size={20} />
          {l.seller}
        </span>
      </div>
    </div>
  </div>
);

const Btn: React.FC<{ children: React.ReactNode; light?: boolean; style?: React.CSSProperties }> = ({ children, light, style }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 44,
      boxSizing: "border-box",
      padding: "0 20px",
      borderRadius: 12,
      fontSize: 15,
      fontWeight: 600,
      background: light ? C.white : C.navy,
      color: light ? C.navy : C.white,
      ...style,
    }}
  >
    {children}
  </span>
);

const SearchBox: React.FC<{ w: number; text?: string; h?: number }> = ({ w, text = "", h = 48 }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 14,
      background: C.white,
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      gap: 10,
      fontSize: 15,
      color: text ? C.ink : C.s400,
      border: `1px solid ${C.aqua}`,
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.s500} strokeWidth="2.2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
    {text || "Search polo, skirt, PE shirt…"}
  </div>
);

/* ------------------------------ Home ------------------------------ */
export type SearchState = { text: string; focus: boolean; open: number; hover: number; picked: boolean };
const NO_SEARCH: SearchState = { text: "", focus: false, open: 0, hover: -1, picked: false };
export const SUGGEST = [LISTINGS[5], LISTINGS[6]];

export const HomeView: React.FC<{ f: number; wiggle?: number; search?: SearchState }> = ({ f, wiggle = 0, search = NO_SEARCH }) => {
  const fan: [Listing, React.CSSProperties][] = [
    [LISTINGS[5], { left: 105, top: 44, zIndex: 3, transform: `translateY(${Math.sin(f / 22) * 5}px)` }],
    [LISTINGS[0], { left: 215, top: 0, zIndex: 2, transform: `rotate(6deg) translateY(${Math.sin(f / 22 + 2) * 5}px)` }],
    [LISTINGS[1], { left: 0, top: 70, zIndex: 1, transform: `rotate(-7deg) translateY(${Math.sin(f / 22 + 4) * 5}px)` }],
  ];
  const caret = search.focus && Math.floor(f / 8) % 2 === 0;
  const chips: [string, number][] = [["Polo", 56], ["Skirt", 62], ["PE shirt", 78], ["Necktie", 76]];
  let cx = 80;
  return (
    <div style={{ width: 1280, height: 680, background: C.white, overflow: "hidden", position: "relative" }}>
      <Navbar active="Home" wiggle={wiggle} />
      <div style={{ position: "absolute", left: 40, top: 84, width: 1200, height: 320, borderRadius: 28, background: C.navy, overflow: "hidden", boxShadow: `0 20px 40px ${C.navy}33` }}>
        <div style={{ position: "absolute", right: -330, top: -370, width: 900, height: 900, background: `radial-gradient(circle, ${C.denim}80 0%, transparent 66%)`, transform: `translate(${Math.sin(f / 40) * 20}px, ${Math.cos(f / 40) * 14}px)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "22px 22px", WebkitMaskImage: "linear-gradient(100deg, transparent 45%, #000)" }} />
        <div style={{ position: "absolute", left: 48, top: 36, fontSize: 14, fontWeight: 600, color: C.cream }}>Good morning, Maria</div>
        <div style={{ position: "absolute", left: 48, top: 58, width: 800, whiteSpace: "nowrap", fontSize: 44, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.9, color: C.white }}>
          Find the right uniform, <span style={{ color: C.cream }}>for less.</span>
        </div>
        <div style={{ position: "absolute", left: 48, top: 128, width: 600, fontSize: 17, color: "rgba(255,255,255,.75)", lineHeight: 1.5 }}>
          Buy pre-loved uniforms from fellow students, or pass on the ones you've outgrown.
        </div>
        <div style={{ position: "absolute", left: 48, top: 196, width: 520, height: 48, borderRadius: 14, background: C.white, display: "flex", alignItems: "center", padding: "0 16px", gap: 10, fontSize: 15, color: search.text ? C.ink : C.s400, boxShadow: search.focus ? `0 0 0 4px ${C.powder}` : "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.s500} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          {search.text || (search.focus ? "" : "Search polo, skirt, PE shirt…")}
          {caret ? <span style={{ width: 2, height: 20, background: C.navy, marginLeft: -8 }} /> : null}
        </div>
        <div style={{ position: "absolute", left: 48, top: 262, fontSize: 13, color: "rgba(255,255,255,.65)", lineHeight: "30px" }}>Popular:</div>
        {chips.map(([c, w]) => {
          const left = 48 + cx;
          cx += w + 8;
          return <span key={c} style={{ position: "absolute", left, top: 262, width: w, height: 30, borderRadius: 999, background: "rgba(255,255,255,.1)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.15)", color: C.white, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>{c}</span>;
        })}
        <div style={{ position: "absolute", left: 870, top: 24, width: 320, height: 300 }}>
          {fan.map(([l, st], i) => (
            <div key={i} style={{ position: "absolute", ...st }}>
              <div style={{ width: 160, padding: 6, borderRadius: 16, background: C.white, boxShadow: `0 20px 30px ${C.deep}80` }}>
                <Photo crop={l.crop} style={{ width: 148, height: 148, borderRadius: 10 }} />
                <div style={{ padding: "8px 4px 2px", fontSize: 12, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden" }}>{l.title}</div>
                <div style={{ padding: "2px 4px 4px", display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <b style={{ color: C.navy }}>₱{l.price}</b>
                  <span style={{ background: C.frost, color: C.navy, padding: "1px 8px", borderRadius: 999, fontWeight: 600 }}>Size {l.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 40, top: 430, width: 1200, display: "flex", gap: 16 }}>
        {["Uniform Shirt", "Pants / Skirt", "PE Uniform", "Accessories"].map((c) => (
          <div key={c} style={{ flex: 1, height: 84, borderRadius: 16, border: `1px solid ${C.aqua}`, display: "flex", alignItems: "center", gap: 14, padding: "0 18px", fontSize: 15, fontWeight: 600, color: C.ink }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: C.frost, display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.navy }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M8 3 3 6l2 4 2-1v11h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0Z" /></svg>
            </span>
            {c}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 40, top: 548, fontSize: 22, fontWeight: 700, color: C.ink }}>Recently listed</div>
      <div style={{ position: "absolute", left: 40, top: 592, display: "flex", gap: 16 }}>
        {LISTINGS.slice(2, 6).map((l) => <ListingCard key={l.title} l={l} w={288} />)}
      </div>
      {search.open > 0 ? (
        <div style={{ position: "absolute", left: 88, top: 334, width: 520, borderRadius: 16, background: C.white, boxShadow: `0 24px 50px ${C.deep}55, 0 0 0 1px ${C.aqua}`, padding: 8, zIndex: 30, opacity: search.open, transform: `translateY(${(1 - search.open) * -10}px)`, transformOrigin: "top" }}>
          {[...SUGGEST.map((l) => ({ t: l.title, s: `₱${l.price} · Size ${l.size}`, l })), { t: "Search “polo” in all uniforms", s: "", l: null }].map((r, i) => {
            const on = search.hover === i;
            return (
              <div key={i} style={{ height: 52, borderRadius: 10, display: "flex", alignItems: "center", gap: 12, padding: "0 10px", background: on ? (search.picked ? C.navy : C.frost) : "transparent", color: on && search.picked ? C.white : C.ink, fontSize: 15, fontWeight: 600 }}>
                {r.l ? <Photo crop={r.l.crop} style={{ width: 36, height: 36, borderRadius: 8 }} /> : <span style={{ width: 36, textAlign: "center" }}>🔍</span>}
                <span style={{ flex: 1 }}>{r.t}</span>
                <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.7 }}>{r.s}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

/* ------------------------------ Browse ------------------------------ */
export const GRID_TOP = 176;
export const CARD_W = 288;
export const CARD_H = 364;
const ALL = [...LISTINGS, ...LISTINGS.slice().reverse()];
const FILTERED = [LISTINGS[0], LISTINGS[6], LISTINGS[3], LISTINGS[0], LISTINGS[3], LISTINGS[5], LISTINGS[6], LISTINGS[3]];
const MENU = ["All categories", "Uniform Shirt", "Pants / Skirt", "PE Uniform", "Accessories"];

export const BrowseView: React.FC<{
  f: number;
  scrollAt: (f: number) => number;
  curAt: (f: number) => Pt;
  menuAt: number;
  filterAt: number;
}> = ({ f, scrollAt, curAt, menuAt, filterAt }) => {
  const filtered = f >= filterAt; // chip + counter update on the click
  const swapped = f >= filterAt + 10; // grid swaps once the old cards have faded out
  const items = swapped ? FILTERED : ALL;
  const scroll = scrollAt(f);
  const cur = curAt(f);
  // hover amount per card, smoothed over the last few frames
  const hoverOf = (i: number) => {
    let n = 0;
    for (let k = 0; k < 6; k++) {
      const c = curAt(f - k);
      const sc = scrollAt(f - k);
      const col = Math.floor((c.x - 40) / (CARD_W + 16));
      const row = Math.floor((c.y + sc - GRID_TOP) / (CARD_H + 16));
      const inX = (c.x - 40) % (CARD_W + 16) < CARD_W;
      const inY = (c.y + sc - GRID_TOP) % (CARD_H + 16) < CARD_H;
      if (c.y > 140 && inX && inY && col >= 0 && col < 4 && row * 4 + col === i && f - k >= 0) n++;
    }
    return n / 6;
  };
  const menu = prog(f, menuAt, menuAt + 8) * (1 - prog(f, filterAt, filterAt + 6));
  const menuHover = cur.x > 612 && cur.x < 832 && cur.y > 138 ? Math.floor((cur.y - 138) / 38) : -1;
  const count = filtered ? Math.round(interpolate(f, [filterAt, filterAt + 14], [24, 8], clamp)) : 24;
  const btnStyle = (on: boolean): React.CSSProperties => ({ padding: "10px 16px", borderRadius: 12, border: `1px solid ${on ? C.navy : C.aqua}`, background: on ? C.navy : C.white, color: on ? C.white : C.navy, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" });
  return (
    <div style={{ width: 1280, height: 680, background: C.white, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", left: 40, top: 64, width: 1200, zIndex: 4, background: C.white, padding: "16px 0 12px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <SearchBox w={560} h={44} />
          <span style={btnStyle(filtered)}>{filtered ? "Uniform Shirt ✕" : "Category ▾"}</span>
          {["Size", "Condition", "Price"].map((x) => <span key={x} style={btnStyle(false)}>{x} ▾</span>)}
          <span style={{ marginLeft: "auto", fontSize: 14, color: C.s500 }}><b style={{ color: C.ink }}>{count}</b> uniforms</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 40, top: GRID_TOP - scroll, display: "grid", gridTemplateColumns: `repeat(4, ${CARD_W}px)`, gap: 16 }}>
        {items.map((l, i) => {
          const t0 = swapped ? filterAt + 10 : 2;
          const enter = prog(f, t0 + i * 2, t0 + 14 + i * 2);
          const exit = swapped ? 1 : 1 - prog(f, filterAt + 2, filterAt + 10);
          const o = enter * exit;
          const h = hoverOf(i);
          return (
            <div key={i} style={{ opacity: o, transform: `translateY(${(1 - enter) * 40}px) scale(${0.92 + 0.08 * enter * exit})`, position: "relative" }}>
              <ListingCard l={l} w={CARD_W} lift={h} />
              <span style={{ position: "absolute", right: 12, top: 12, width: 34, height: 34, borderRadius: "50%", background: C.white, boxShadow: "0 4px 12px rgba(0,0,0,.2)", opacity: h, transform: `scale(${0.7 + 0.3 * h})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2" strokeLinejoin="round"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" /></svg>
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1280, zIndex: 5 }}><Navbar active="Browse" /></div>
      {menu > 0 ? (
        <div style={{ position: "absolute", left: 612, top: 130, width: 220, padding: 8, borderRadius: 14, background: C.white, boxShadow: `0 20px 40px ${C.deep}44, 0 0 0 1px ${C.aqua}`, zIndex: 8, opacity: menu, transform: `scale(${0.94 + 0.06 * menu})`, transformOrigin: "top left" }}>
          {MENU.map((m, i) => (
            <div key={m} style={{ height: 38, borderRadius: 8, padding: "0 12px", display: "flex", alignItems: "center", fontSize: 14, fontWeight: 600, background: menuHover === i ? C.frost : "transparent", color: menuHover === i ? C.navy : C.ink }}>{m}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

/* ------------------------------ Listing details ------------------------------ */
export const DetailView: React.FC<{ f: number; heartAt: number; msgAt: number; typeAt: number; sentAt: number }> = ({ f, heartAt, msgAt, typeAt, sentAt }) => {
  const saved = f >= heartAt;
  const pop = interpolate(f, [heartAt, heartAt + 6, heartAt + 14], [1, 1.45, 1], clamp);
  const msg = typed("Hi! Is this still available?", f, typeAt, 0.65);
  const sent = f >= sentAt;
  const btn = interpolate(f, [sentAt - 2, sentAt + 2, sentAt + 10], [1, 0.95, 1], clamp);
  const toast = interpolate(f, [sentAt + 2, sentAt + 16, sentAt + 56, sentAt + 70], [-90, 80, 80, -90], { ...clamp, easing: ease });
  const th = f - heartAt;
  return (
    <div style={{ width: 1280, height: 680, background: C.white, overflow: "hidden", position: "relative" }}>
      <Navbar active="Browse" />
      <div style={{ position: "absolute", left: 40, top: 88, fontSize: 13, color: C.s500 }}>← Back to results</div>
      <div style={{ position: "absolute", left: 40, top: 118, width: 500, height: 500, borderRadius: 24, overflow: "hidden", border: `1px solid ${C.aqua}` }}>
        <Photo crop={POLO.crop} style={{ width: "100%", height: "100%", transform: `scale(${1 + f * 0.0006})` }} />
        <Chip style={{ position: "absolute", left: 16, top: 16, fontSize: 13 }}>{POLO.cond}</Chip>
        <span style={{ position: "absolute", right: 16, top: 16, width: 44, height: 44, borderRadius: "50%", background: C.white, boxShadow: "0 4px 14px rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop})` }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? C.navy : "none"} stroke={C.navy} strokeWidth="2" strokeLinejoin="round"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" /></svg>
        </span>
      </div>
      {th >= 0 && th < 44
        ? [0, 1, 2, 3, 4].map((j) => (
            <svg key={j} width="20" height="20" viewBox="0 0 24 24" fill={C.white} stroke="none" style={{ position: "absolute", left: 502 + (j - 2) * 15 + Math.sin(th / 5 + j) * 9 - 10, top: 160 - th * (2 + j * 0.25) - 10, opacity: 1 - th / 44, zIndex: 12, filter: "drop-shadow(0 2px 3px rgba(0,0,0,.35))" }}>
              <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" />
            </svg>
          ))
        : null}
      <div style={{ position: "absolute", left: 580, top: 118, width: 660 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[POLO.cat, `Size ${POLO.size}`, "Buy or Exchange"].map((c) => (
            <span key={c} style={{ padding: "4px 12px", borderRadius: 999, background: C.frost, color: C.navy, fontSize: 13, fontWeight: 600 }}>{c}</span>
          ))}
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.ink, letterSpacing: -0.6, lineHeight: 1.2, marginTop: 14 }}>{POLO.title}</div>
        <div style={{ fontSize: 38, fontWeight: 800, color: C.navy, marginTop: 10 }}>₱{POLO.price}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, fontSize: 15, color: C.s500 }}>
          <Avatar name={POLO.seller} size={34} /> <span><b style={{ color: C.ink }}>{POLO.seller}</b> · Grade 10 · listed 2 days ago</span>
        </div>
        <div style={{ marginTop: 18, fontSize: 15, lineHeight: 1.6, color: C.ink, padding: 18, borderRadius: 16, background: C.frost }}>
          Worn for one term only. No stains or fading, all buttons intact. Fits a student around 5'3". Happy to meet up at the school gate.
        </div>
      </div>
      <div style={{ position: "absolute", left: 580, top: 436, width: 660, height: 46, boxSizing: "border-box", borderRadius: 12, border: `${f >= msgAt ? 2 : 1}px solid ${f >= msgAt ? C.navy : C.aqua}`, padding: "0 16px", display: "flex", alignItems: "center", fontSize: 15, color: msg ? C.ink : C.s400 }}>
        {msg || "Write a message to Mika…"}
        {f >= msgAt && !sent && Math.floor(f / 8) % 2 === 0 ? <span style={{ width: 2, height: 20, background: C.navy, marginLeft: 1 }} /> : null}
      </div>
      <Btn style={{ position: "absolute", left: 580, top: 498, width: 660, height: 52, fontSize: 16, transform: `scale(${btn})`, background: sent ? C.deep : C.navy }}>
        {sent ? "✓ Request sent" : "Request to buy →"}
      </Btn>
      <div style={{ display: f >= sentAt + 2 && f <= sentAt + 70 ? "block" : "none", position: "absolute", left: 800, top: toast, zIndex: 40, padding: "14px 24px", borderRadius: 14, background: C.deep, color: C.white, fontSize: 15, fontWeight: 600, boxShadow: `0 14px 30px ${C.deep}66` }}>
        ✓ Request sent to Mika. You can chat in Messages.
      </div>
    </div>
  );
};

/* ------------------------------ Sell form ------------------------------ */
const Card: React.FC<{ top: number; h: number; title: string; n: number; children?: React.ReactNode }> = ({ top, h, title, n, children }) => (
  <div style={{ position: "absolute", left: 40, top, width: 760, height: h, borderRadius: 18, background: C.white, border: `1px solid ${C.aqua}`, boxShadow: `0 4px 12px ${C.navy}0d` }}>
    <div style={{ position: "absolute", left: 24, top: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 700, color: C.ink }}>
      <span style={{ width: 26, height: 26, borderRadius: 8, background: C.navy, color: C.white, fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
      {title}
    </div>
    {children}
  </div>
);
const Pick: React.FC<{ x: number; y: number; w: number; on: boolean; label: string; since?: number }> = ({ x, y, w, on, label, since = 0 }) => (
  <span style={{ position: "absolute", left: x, top: y, width: w, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, background: on ? C.navy : C.white, color: on ? C.white : C.ink, border: `1px solid ${on ? C.navy : C.aqua}`, transform: `scale(${on ? 1 + 0.1 * Math.max(0, 1 - since / 9) : 1})`, boxShadow: on ? `0 6px 14px ${C.navy}40` : "none" }}>{label}</span>
);
const Label: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <span style={{ position: "absolute", left: x, top: y, fontSize: 13, fontWeight: 600, color: C.ink }}>{children}</span>
);

export const SellView: React.FC<{ f: number; scroll: number }> = ({ f, scroll }) => {
  const photo = f >= 54;
  const hot = f >= 22 && f < 40;
  const upload = prog(f, 38, 54);
  const title = typed("White polo shirt with school logo", f, 58, 0.5);
  const cat = f >= 152;
  const size = f >= 164;
  const cond = f >= 176;
  const open = f >= 214;
  const price = typed("250", f, 232, 0.25);
  const posted = f >= 270;
  const done = (b: boolean) => (b ? C.navy : C.s400);
  const photoPop = prog(f, 54, 68);
  const toast = interpolate(f, [272, 288, 340, 354], [-90, 76, 76, -90], { ...clamp, easing: ease });
  return (
    <div style={{ width: 1280, height: 680, background: C.frost, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 84 - scroll, width: 1280 }}>
        <Card top={0} h={190} title="Add photos" n={1}>
          <div style={{ position: "absolute", left: 24, top: 56, width: 712, height: 110, borderRadius: 14, border: `2px dashed ${hot ? C.navy : C.powder}`, background: hot ? C.aqua : C.frost, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: C.s500, fontSize: 14, fontWeight: 500 }}>
            {photo ? (
              <div style={{ position: "absolute", left: 14, top: 8, width: 90, height: 90, borderRadius: 10, overflow: "hidden", transform: `scale(${0.6 + 0.4 * photoPop})`, opacity: photoPop, boxShadow: `0 6px 14px ${C.navy}33` }}>
                <Photo crop={POLO.crop} style={{ width: "100%", height: "100%" }} />
              </div>
            ) : null}
            <span style={{ marginLeft: photo ? 90 : 0 }}>{photo ? "1 / 5 photos · add more" : hot ? "Drop to upload" : f >= 38 ? "Uploading…" : "Drop photos here or click to upload (up to 5)"}</span>
            {f >= 38 && !photo ? <span style={{ position: "absolute", left: 40, right: 40, bottom: 14, height: 6, borderRadius: 3, background: C.powder }}><span style={{ display: "block", height: "100%", width: `${upload * 100}%`, borderRadius: 3, background: C.navy }} /></span> : null}
          </div>
        </Card>
        <Card top={210} h={470} title="Details" n={2}>
          <Label x={24} y={52}>Title</Label>
          <div style={{ position: "absolute", left: 24, top: 74, width: 712, height: 44, borderRadius: 12, border: `1px solid ${f >= 56 && f < 125 ? C.navy : C.aqua}`, padding: "0 14px", display: "flex", alignItems: "center", fontSize: 15, color: title ? C.ink : C.s400 }}>
            {title || "e.g. White polo shirt with school logo"}
            {f >= 56 && f < 125 && Math.floor(f / 8) % 2 === 0 ? <span style={{ width: 2, height: 20, background: C.navy, marginLeft: 1 }} /> : null}
          </div>
          <Label x={24} y={136}>Category</Label>
          {["Uniform Shirt", "Pants / Skirt", "PE Uniform", "Accessories"].map((c, i) => (
            <Pick key={c} x={24 + i * 176} y={158} w={166} on={cat && i === 0} label={c} since={f - 152} />
          ))}
          <Label x={24} y={216}>Size</Label>
          {["XS", "S", "M", "L", "XL", "XXL"].map((s, i) => (
            <Pick key={s} x={24 + i * 74} y={238} w={64} on={size && s === "M"} label={s} since={f - 164} />
          ))}
          <Label x={24} y={296}>Condition</Label>
          {["New", "Like New", "Good", "Fair"].map((c, i) => (
            <Pick key={c} x={24 + i * 176} y={318} w={166} on={cond && i === 1} label={c} since={f - 176} />
          ))}
          <Label x={24} y={378}>Description (optional)</Label>
          <div style={{ position: "absolute", left: 24, top: 400, width: 712, height: 50, borderRadius: 12, border: `1px solid ${C.aqua}`, padding: "12px 14px", fontSize: 14, color: C.s400 }}>Fit, flaws, where you can meet…</div>
        </Card>
        <Card top={700} h={170} title="Open to & price" n={3}>
          {["Buy Only", "Exchange Only", "Buy or Exchange"].map((c, i) => (
            <Pick key={c} x={24 + i * 232} y={52} w={222} on={open && i === 2} label={c} since={f - 214} />
          ))}
          <Label x={24} y={106}>Price (₱)</Label>
          <div style={{ position: "absolute", left: 24, top: 124, width: 200, height: 40, borderRadius: 12, border: `1px solid ${C.aqua}`, padding: "0 14px", display: "flex", alignItems: "center", fontSize: 15, color: price ? C.ink : C.s400 }}>{price || "0"}</div>
        </Card>
      </div>
      {/* live preview + post button */}
      <div style={{ position: "absolute", left: 830, top: 84, width: 410, height: 386, borderRadius: 18, background: C.white, border: `1px solid ${C.aqua}`, boxShadow: `0 8px 20px ${C.navy}14`, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.s500, marginBottom: 10 }}>Live preview</div>
        <div style={{ height: 210, borderRadius: 12, overflow: "hidden", background: C.frost, display: "flex", alignItems: "center", justifyContent: "center", color: C.s400, fontSize: 14, position: "relative" }}>
          {photo ? <Photo crop={POLO.crop} style={{ width: "100%", height: "100%", opacity: photoPop }} /> : "No photo yet"}
          {cond ? <Chip style={{ position: "absolute", left: 10, top: 10 }}>Like New</Chip> : null}
          {posted ? <Chip style={{ position: "absolute", right: 10, top: 10, background: C.navy, color: C.white }}>● Live</Chip> : null}
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: title ? C.ink : C.s400, marginTop: 12, whiteSpace: "nowrap", overflow: "hidden" }}>{title || "Your title"}</div>
        <div style={{ fontSize: 13, color: C.s500, marginTop: 2 }}>{size ? "Size M" : "Size"} · {cat ? "Uniform Shirt" : "Category"}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginTop: 8 }}>{price ? `₱${price}` : "₱0"}{open ? <span style={{ fontSize: 12, fontWeight: 600, color: C.s500, marginLeft: 10 }}>Buy or Exchange</span> : null}</div>
      </div>
      <div style={{ position: "absolute", left: 830, top: 484, width: 410, height: 72, borderRadius: 14, background: C.white, border: `1px solid ${C.aqua}`, padding: "10px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: 13, fontWeight: 600, alignContent: "center", gap: "4px 0" }}>
        {([["Photo", photo], ["Title", title.length > 10], ["Size & category", size && cat], ["Price", price.length > 0]] as const).map(([k, ok]) => (
          <span key={k} style={{ color: done(ok) }}>{ok ? "✓" : "○"} {k}</span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 830, top: 576, width: 410, height: 48, borderRadius: 14, background: posted ? C.deep : C.navy, color: C.white, fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${f >= 268 && f < 274 ? 0.96 : 1})`, opacity: size && price ? 1 : 0.55 }}>
        {posted ? "✓ Posted" : "Post listing"}
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1280, zIndex: 5 }}><Navbar active="Sell" /></div>
      <div style={{ display: f >= 272 && f <= 354 ? "block" : "none", position: "absolute", left: 340, top: toast, zIndex: 9, padding: "14px 26px", borderRadius: 14, background: C.deep, color: C.white, fontSize: 16, fontWeight: 600, boxShadow: `0 14px 30px ${C.deep}66` }}>
        ✓ Listing posted. Students can now find it!
      </div>
    </div>
  );
};
