import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Amazon.com";

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
        <div style={{ display: "flex", fontSize: 100, fontWeight: 800 }}>
          <span>amazon</span>
        </div>
        <div
          style={{
            width: 260,
            height: 10,
            marginTop: 4,
            background: "#ff9900",
            borderRadius: 999,
          }}
        />
        <div style={{ fontSize: 40, marginTop: 40, color: "#d5d9d9" }}>
          Spend less. Smile more.
        </div>
      </div>
    ),
    size,
  );
}
