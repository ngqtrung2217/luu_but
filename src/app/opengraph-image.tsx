import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Lưu Bút Của Trung - Nơi lưu giữ những kỷ niệm quý giá";
export const size = {
  width: 1200,
  height: 630,
};

// Image generation
export async function GET() {
  // No need to load custom font, using system fonts instead

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: "linear-gradient(to bottom right, #121212, #4b0082)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          color: "white",
          padding: "3rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 90,
            letterSpacing: "-0.05em",
            fontWeight: "bold",
            marginBottom: "1rem",
            background: "linear-gradient(to right, #9400d3, #8a2be2, #4b0082)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Lưu Bút Của Trung
        </div>
        <div
          style={{
            fontSize: 36,
            marginTop: "1rem",
            opacity: 0.9,
          }}
        >
          Nơi lưu giữ những kỷ niệm đáng nhớ
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "3rem",
            fontSize: 24,
            opacity: 0.7,
          }}
        >
          Next.js • Supabase • Framer Motion • Fullpage.js
        </div>
      </div>
    ),
    {
      // Options
      ...size,
    }
  );
}
