import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { C, Listing, LISTINGS, Photo, POLO, clamp, ease, prog, typed } from "./theme";

/* Faithful mock-ups of the real pages (client/src/pages/*). Each view is laid out in a 1280x680 viewport. */

export const LogoTile: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <div
    style={{
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
      src={staticFile("logo.png")}
      style={{ width: size * 0.78, height: size * 0.78, objectFit: "contain", filter: "brightness(0) invert(1)" }}
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

export const Navbar: React.FC<{ active: string }> = ({ active }) => (
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
    <LogoTile />
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
export const HomeView: React.FC<{ f: number }> = ({ f }) => {
  const fan: [Listing, React.CSSProperties][] = [
    [LISTINGS[5], { left: 105, top: 44, zIndex: 3, transform: `translateY(${Math.sin(f / 22) * 5}px)` }],
    [LISTINGS[0], { left: 215, top: 0, zIndex: 2, transform: `rotate(6deg) translateY(${Math.sin(f / 22 + 2) * 5}px)` }],
    [LISTINGS[1], { left: 0, top: 70, zIndex: 1, transform: `rotate(-7deg) translateY(${Math.sin(f / 22 + 4) * 5}px)` }],
  ];
  return (
    <div style={{ width: 1280, height: 680, background: C.white, overflow: "hidden", position: "relative" }}>
      <Navbar active="Home" />
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 84,
          width: 1200,
          height: 320,
          borderRadius: 28,
          background: C.navy,
          overflow: "hidden",
          boxShadow: `0 20px 40px ${C.navy}33`,
        }}
      >
        <div style={{ position: "absolute", right: -120, top: -160, width: 450, height: 450, borderRadius: "50%", background: `${C.denim}73`, filter: "blur(60px)", transform: `translate(${Math.sin(f / 40) * 20}px, ${Math.cos(f / 40) * 14}px)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "22px 22px", WebkitMaskImage: "linear-gradient(100deg, transparent 45%, #000)" }} />
        <div style={{ position: "absolute", left: 48, top: 40, width: 700, color: C.white }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.cream }}>Good morning, Maria</div>
          <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15, letterSpacing: -0.9, marginTop: 8 }}>
            Find the right uniform, <span style={{ color: C.cream }}>for less.</span>
          </div>
          <div style={{ fontSize: 17, color: "rgba(255,255,255,.75)", marginTop: 12, width: 560 }}>
            Buy pre-loved uniforms from fellow students, or pass on the ones you've outgrown.
          </div>
          <div style={{ marginTop: 20 }}><SearchBox w={520} /></div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14, fontSize: 13 }}>
            <span style={{ color: "rgba(255,255,255,.65)", marginRight: 4 }}>Popular:</span>
            {["Polo", "Skirt", "PE shirt", "Necktie"].map((p) => (
              <span key={p} style={{ padding: "5px 12px", borderRadius: 999, background: "rgba(255,255,255,.1)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.15)", fontWeight: 500 }}>{p}</span>
            ))}
          </div>
        </div>
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
    </div>
  );
};

/* ------------------------------ Browse ------------------------------ */
export const GRID_TOP = 176;
export const CARD_W = 288;
export const CARD_H = 364;

export const BrowseView: React.FC<{ scroll: number; hover?: number; hoverAmt?: number }> = ({ scroll, hover = -1, hoverAmt = 0 }) => (
  <div style={{ width: 1280, height: 680, background: C.white, overflow: "hidden", position: "relative" }}>
    <div style={{ position: "absolute", left: 40, top: 64, width: 1200, zIndex: 4, background: C.white, padding: "16px 0 12px" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <SearchBox w={560} h={44} />
        {["Category", "Size", "Condition", "Price"].map((x) => (
          <span key={x} style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${C.aqua}`, fontSize: 14, fontWeight: 600, color: C.navy }}>{x} ▾</span>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 14, color: C.s500 }}><b style={{ color: C.ink }}>24</b> uniforms</span>
      </div>
    </div>
    <div style={{ position: "absolute", left: 40, top: GRID_TOP - scroll, display: "grid", gridTemplateColumns: `repeat(4, ${CARD_W}px)`, gap: 16 }}>
      {[...LISTINGS, ...LISTINGS.slice().reverse()].map((l, i) => (
        <ListingCard key={i} l={l} w={CARD_W} lift={i === hover ? hoverAmt : 0} />
      ))}
    </div>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1280, zIndex: 5 }}><Navbar active="Browse" /></div>
  </div>
);

/* ------------------------------ Listing details ------------------------------ */
export const DetailView: React.FC<{ f: number; saveAt: number }> = ({ f, saveAt }) => {
  const saved = f >= saveAt;
  const pop = interpolate(f, [saveAt, saveAt + 6, saveAt + 14], [1, 1.45, 1], clamp);
  const pulse = 1 + Math.max(0, Math.sin(f / 7)) * 0.025;
  return (
    <div style={{ width: 1280, height: 680, background: C.white, overflow: "hidden", position: "relative" }}>
      <Navbar active="Browse" />
      <div style={{ position: "absolute", left: 40, top: 88, fontSize: 13, color: C.s500 }}>← Back to results</div>
      <div style={{ position: "absolute", left: 40, top: 118, width: 500, height: 500, borderRadius: 24, overflow: "hidden", border: `1px solid ${C.aqua}` }}>
        <Photo crop={POLO.crop} style={{ width: "100%", height: "100%", transform: `scale(${1 + f * 0.0004})` }} />
        <Chip style={{ position: "absolute", left: 16, top: 16, fontSize: 13 }}>{POLO.cond}</Chip>
        <span style={{ position: "absolute", right: 16, top: 16, width: 44, height: 44, borderRadius: "50%", background: C.white, boxShadow: "0 4px 14px rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop})` }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? C.navy : "none"} stroke={C.navy} strokeWidth="2" strokeLinejoin="round"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" /></svg>
        </span>
      </div>
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
        <div style={{ marginTop: 16, height: 46, borderRadius: 12, border: `1px solid ${C.aqua}`, padding: "0 16px", display: "flex", alignItems: "center", fontSize: 14, color: C.s400 }}>Hi! Is this still available?</div>
        <Btn style={{ marginTop: 14, width: 660, height: 52, fontSize: 16, transform: `scale(${pulse})` }}>Request to buy →</Btn>
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
const Pick: React.FC<{ x: number; y: number; w: number; on: boolean; label: string }> = ({ x, y, w, on, label }) => (
  <span style={{ position: "absolute", left: x, top: y, width: w, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, background: on ? C.navy : C.white, color: on ? C.white : C.ink, border: `1px solid ${on ? C.navy : C.aqua}`, transform: `scale(${on ? 1 : 1})` }}>{label}</span>
);
const Label: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <span style={{ position: "absolute", left: x, top: y, fontSize: 13, fontWeight: 600, color: C.ink }}>{children}</span>
);

export const SellView: React.FC<{ f: number; scroll: number }> = ({ f, scroll }) => {
  const photo = f >= 40;
  const title = typed("White polo shirt with school logo", f, 58, 0.5);
  const cat = f >= 152;
  const size = f >= 164;
  const cond = f >= 176;
  const open = f >= 214;
  const price = typed("250", f, 232, 0.25);
  const posted = f >= 270;
  const done = (b: boolean) => (b ? C.navy : C.s400);
  const photoPop = prog(f, 40, 56);
  const toast = interpolate(f, [272, 288, 340, 354], [-70, 16, 16, -70], { ...clamp, easing: ease });
  return (
    <div style={{ width: 1280, height: 680, background: C.frost, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 84 - scroll, width: 1280 }}>
        <Card top={0} h={190} title="Add photos" n={1}>
          <div style={{ position: "absolute", left: 24, top: 56, width: 712, height: 110, borderRadius: 14, border: `2px dashed ${C.powder}`, background: C.frost, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: C.s500, fontSize: 14, fontWeight: 500 }}>
            {photo ? (
              <div style={{ position: "absolute", left: 14, top: 8, width: 90, height: 90, borderRadius: 10, overflow: "hidden", transform: `scale(${0.6 + 0.4 * photoPop})`, opacity: photoPop, boxShadow: `0 6px 14px ${C.navy}33` }}>
                <Photo crop={POLO.crop} style={{ width: "100%", height: "100%" }} />
              </div>
            ) : null}
            <span style={{ marginLeft: photo ? 90 : 0 }}>{photo ? "1 / 5 photos · add more" : "Drop photos here or click to upload (up to 5)"}</span>
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
            <Pick key={c} x={24 + i * 176} y={158} w={166} on={cat && i === 0} label={c} />
          ))}
          <Label x={24} y={216}>Size</Label>
          {["XS", "S", "M", "L", "XL", "XXL"].map((s, i) => (
            <Pick key={s} x={24 + i * 74} y={238} w={64} on={size && s === "M"} label={s} />
          ))}
          <Label x={24} y={296}>Condition</Label>
          {["New", "Like New", "Good", "Fair"].map((c, i) => (
            <Pick key={c} x={24 + i * 176} y={318} w={166} on={cond && i === 1} label={c} />
          ))}
          <Label x={24} y={378}>Description (optional)</Label>
          <div style={{ position: "absolute", left: 24, top: 400, width: 712, height: 50, borderRadius: 12, border: `1px solid ${C.aqua}`, padding: "12px 14px", fontSize: 14, color: C.s400 }}>Fit, flaws, where you can meet…</div>
        </Card>
        <Card top={700} h={170} title="Open to & price" n={3}>
          {["Buy Only", "Exchange Only", "Buy or Exchange"].map((c, i) => (
            <Pick key={c} x={24 + i * 232} y={52} w={222} on={open && i === 2} label={c} />
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
      <div style={{ position: "absolute", left: 340, top: toast, zIndex: 9, padding: "14px 26px", borderRadius: 14, background: C.deep, color: C.white, fontSize: 16, fontWeight: 600, boxShadow: `0 14px 30px ${C.deep}66` }}>
        ✓ Listing posted. Students can now find it!
      </div>
    </div>
  );
};
