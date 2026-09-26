import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Still Coffee Co.";

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
          background: "#f8f5ef",
          color: "#221a12",
          fontFamily: "serif",
          fontStyle: "italic",
        }}
      >
        <div style={{ display: "flex", fontSize: 100, fontWeight: 500 }}>
          <span>still</span>
        </div>
        <div
          style={{
            width: 260,
            height: 4,
            marginTop: 12,
            background: "#b5732a",
            borderRadius: 999,
          }}
        />
        <div
          style={{
            fontSize: 40,
            marginTop: 40,
            fontStyle: "normal",
            fontFamily: "sans-serif",
            color: "#66594a",
          }}
        >
          One coffee, done well.
        </div>
      </div>
    ),
    size,
  );
}
