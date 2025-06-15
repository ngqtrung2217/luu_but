"use client";

import dynamic from "next/dynamic";

// Dynamically import the AutoplayMusicPlayer with no SSR to avoid hydration issues
const CornerMusicPlayer = dynamic(
  () => import("./AutoplayMusicPlayer"),
  { ssr: false }
);

export default function ClientCornerPlayer() {
  return <CornerMusicPlayer />;
}
