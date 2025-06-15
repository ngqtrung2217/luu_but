import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-6">
          Không tìm thấy trang
        </h2>
        <p className="text-gray-400 mb-8">
          Trang bạn đang tìm kiếm có thể đã bị di chuyển, đổi tên hoặc không tồn
          tại.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}
