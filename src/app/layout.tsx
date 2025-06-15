import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientCornerPlayer from "@/components/ClientCornerPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lưu Bút Của Trung",
  description: "Nơi lưu giữ những kỷ niệm đáng nhớ",
};

// The music player is now imported via ClientCornerPlayer

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white min-h-screen`}
      >
        <AuthProvider>
          {children}
          <ClientCornerPlayer />
        </AuthProvider>
      </body>
    </html>
  );
}
