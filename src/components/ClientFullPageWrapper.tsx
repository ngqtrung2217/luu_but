"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// Dynamic import of FullPageScroll component
const FullPageScroll = dynamic(() => import("@/components/FullPageScroll"), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  ),
});

export default function ClientFullPageWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same height to prevent layout shift
    return <div className="min-h-screen bg-gray-900" />;
  }

  return <FullPageScroll />;
}
