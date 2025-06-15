import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "linear-gradient(to bottom right, #4b0082, #9400d3)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
          borderRadius: "50%",
          padding: "1rem",
        }}
      >
        <div style={{ fontSize: 16, marginBottom: "-0.25rem" }}>📝</div>
        <div style={{ fontSize: 10 }}>LB</div>
      </div>
    ),
    { ...size }
  );
}
