import React from "react";
import { Easing, Img, interpolate, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

// Poppins, the site's typeface, bundled locally (public/fonts) so renders work offline
export const fontFamily = "Poppins";
for (const weight of [400, 500, 600, 700, 800]) {
  loadFont({ family: fontFamily, url: staticFile(`fonts/Poppins-${weight}.ttf`), weight: String(weight) });
}

// Brand palette from client/src/index.css (Snow White + Anchor Navy and blends)
export const C = {
  ink: "#0b2b4e",
  navy: "#0e3661",
  deep: "#09213c",
  denim: "#486687",
  powder: "#b7c3d0",
  cream: "#e2e7ec",
  aqua: "#dde3e9",
  frost: "#eef1f4",
  white: "#ffffff",
  s400: "#8b9fb3",
  s500: "#4d6a8a",
};

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 -> 1 between frames a and b with the site's ease-out curve */
export const prog = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

export const typed = (s: string, f: number, start: number, cps = 2) =>
  s.slice(0, Math.max(0, Math.floor((f - start) * cps)));

/** Crops a region of the stock uniform photo, so one image can stand in for many listing photos.
 *  crop = [x, y, zoom]: the point (x, y) of the photo (0-1) is centred, magnified to `zoom` x container width. */
export const Photo: React.FC<{
  crop: readonly [number, number, number];
  style?: React.CSSProperties;
}> = ({ crop: [fx, fy, zoom], style }) => (
  <div style={{ position: "relative", overflow: "hidden", ...style }}>
    <Img
      src={staticFile("uniforms.jpg")}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: `${zoom * 100}%`,
        height: "auto",
        maxWidth: "none",
        transform: `translate(${-fx * 100}%, ${-fy * 100}%)`,
      }}
    />
  </div>
);

export type Listing = {
  title: string;
  price: number;
  size: string;
  cond: string;
  cat: string;
  crop: readonly [number, number, number];
  seller: string;
};

export const LISTINGS: Listing[] = [
  { title: "Navy school cardigan", price: 350, size: "S", cond: "Good", cat: "Uniform Shirt", crop: [0.3, 0.33, 2.6], seller: "Ana" },
  { title: "Pleated navy skirt", price: 300, size: "M", cond: "Like New", cat: "Pants / Skirt", crop: [0.3, 0.72, 2.6], seller: "Joy" },
  { title: "Navy PE jersey", price: 200, size: "L", cond: "Good", cat: "PE Uniform", crop: [0.66, 0.66, 2.6], seller: "Ken" },
  { title: "White blouse", price: 220, size: "S", cond: "New", cat: "Uniform Shirt", crop: [0.7, 0.75, 2.6], seller: "Mia" },
  { title: "Grey school slacks", price: 280, size: "L", cond: "Good", cat: "Pants / Skirt", crop: [0.3, 0.62, 2.6], seller: "Leo" },
  { title: "White polo with school logo", price: 250, size: "M", cond: "Like New", cat: "Uniform Shirt", crop: [0.68, 0.36, 2.6], seller: "Mika" },
  { title: "Polo with crest", price: 240, size: "XL", cond: "Like New", cat: "Uniform Shirt", crop: [0.78, 0.41, 4], seller: "Rey" },
  { title: "Navy school trousers", price: 260, size: "XL", cond: "Fair", cat: "Pants / Skirt", crop: [0.32, 0.8, 3], seller: "Zoe" },
];
export const POLO = LISTINGS[5];
