"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "Arial, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            Something went wrong
          </h1>
          <p style={{ margin: "0.5rem 0 1rem", color: "#565959" }}>
            An unexpected error occurred.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#ffd814",
              border: "none",
              borderRadius: "999px",
              padding: "0.5rem 1.5rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
