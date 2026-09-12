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
          background: "#f8f7f2",
          color: "#1f1d15",
          fontFamily: "serif",
          fontStyle: "italic",
        }}
      >
        <div style={{ display: "flex", fontSize: 100, fontWeight: 500 }}>
          <span>amazon</span>
        </div>
        <div
          style={{
            width: 260,
            height: 4,
            marginTop: 12,
            background: "#284c32",
            borderRadius: 999,
          }}
        />
        <div
          style={{
            fontSize: 40,
            marginTop: 40,
            fontStyle: "normal",
            fontFamily: "sans-serif",
            color: "#605d56",
          }}
        >
          Spend less. Smile more.
        </div>
      </div>
    ),
    size,
  );
}
