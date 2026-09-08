import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Amazon clone — a working storefront slice";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "#131921",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 88, fontWeight: 800 }}>
          <span>amazon</span>
          <span style={{ color: "#ffa41c" }}>.clone</span>
        </div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#d5d9d9" }}>
          Browse · search · cart · checkout — a working storefront slice
        </div>
        <div style={{ fontSize: 28, marginTop: 40, color: "#8d9096" }}>
          Next.js · Prisma · Postgres · built as a timed assignment
        </div>
      </div>
    ),
    size,
  );
}
