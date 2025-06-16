import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quản trị - Lưu Bút Của Trung",
  description: "Trang quản trị dành cho admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="bg-gray-800 py-4 px-6 shadow-lg border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/admin"
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
          >
            Admin Dashboard
          </Link>

          <div className="flex space-x-6">
            <Link
              href="/admin/messages"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Lưu Bút
            </Link>
            <Link
              href="/admin/music"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Nhạc
            </Link>
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </nav>
      <div className="pt-4">{children}</div>
    </>
  );
}
