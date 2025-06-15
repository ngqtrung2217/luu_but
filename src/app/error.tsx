"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-red-900/30 p-8 rounded-lg border border-red-500 max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Có lỗi xảy ra!</h2>
        <p className="text-gray-300 mb-6">
          {error.message || "Đã xảy ra lỗi không xác định."}
        </p>
        <button
          onClick={reset}
          className="w-full bg-red-600 hover:bg-red-700 transition-colors py-2 px-4 rounded-md text-white font-medium"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
