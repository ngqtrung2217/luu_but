"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { GuestbookEntry } from "@/utils/supabase";
import { motion } from "@/utils/motion";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GuestbookEntries() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedEntry, setSelectedEntry] = useState<GuestbookEntry | null>(
    null
  );

  useEffect(() => {
    // Check if user has admin role
    const checkAdminStatus = async () => {
      // Check if admin status is stored in localStorage
      const isAdminAuthenticated =
        localStorage.getItem("isAdminAuthenticated") === "true";

      if (isAdminAuthenticated) {
        setIsAdmin(true);
        fetchEntries();
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      } // In a real app, we'd check for admin role in the user's metadata or claims
      const { data } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (data) {
        setIsAdmin(true);
        fetchEntries();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAdminStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("luubut")
        .select("*")
        .order("created_at", { ascending: sortOrder === "asc" });

      if (error) throw error;

      setEntries(data as GuestbookEntry[]);
      setError(null);
    } catch (err) {
      console.error("Error fetching entries:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when sort order changes
  useEffect(() => {
    if (isAdmin) {
      fetchEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder, isAdmin]);

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lưu bút này không?")) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("luubut").delete().eq("id", id);

      if (error) throw error;

      // Update the UI by removing the deleted entry
      setEntries(entries.filter((entry) => entry.id !== id));
      toast.success("Đã xóa lưu bút thành công");
    } catch (err) {
      console.error("Error deleting entry:", err);
      toast.error(
        `Lỗi khi xóa: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Filter entries based on search term
  const filteredEntries = entries.filter((entry) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.name?.toLowerCase().includes(searchLower) ||
      entry.message?.toLowerCase().includes(searchLower) ||
      entry.email?.toLowerCase().includes(searchLower)
    );
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-red-500/20 p-6 rounded-lg border border-red-500 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            Khu vực dành cho Admin
          </h2>
          <p className="text-gray-300">
            Bạn không có quyền truy cập vào trang này.
          </p>
        </div>
      </div>
    );
  }

  if (loading && entries.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error && entries.length === 0) {
    return (
      <div className="bg-red-500/20 p-6 rounded-lg border border-red-500 text-center">
        <h2 className="text-xl font-bold text-red-400 mb-2">Lỗi</h2>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ToastContainer position="top-right" theme="dark" />

      {/* Header with navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Quản lý Lưu bút
          </h1>
          <p className="text-gray-400">Xem và quản lý các lưu bút</p>
        </div>

        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link
            href="/admin"
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/music"
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Quản lý Nhạc
          </Link>
        </div>
      </div>

      {/* Search and sort controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Tìm kiếm theo tên, email hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>

        <button
          onClick={toggleSortOrder}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <span>Sắp xếp: {sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}</span>
          {sortOrder === "desc" ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
              ></path>
            </svg>
          )}
        </button>

        <button
          onClick={fetchEntries}
          className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          <span>Làm mới</span>
        </button>
      </div>

      {loading && entries.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-gray-400 mt-2">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Entry count */}
      <p className="text-gray-400 mb-4">
        Tổng số lưu bút: {filteredEntries.length}
      </p>

      {/* Messages grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden shadow-lg"
          >
            <div className="p-5">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-white mb-2 truncate">
                  {entry.name || "Người bạn ẩn danh"}
                </h3>
                <div className="text-xs text-gray-400">
                  {new Date(entry.created_at).toLocaleDateString("vi-VN")}
                </div>
              </div>

              {entry.email && (
                <p className="text-sm text-blue-400 mb-3 truncate">
                  {entry.email}
                </p>
              )}

              <div className="prose prose-sm prose-invert max-w-none mb-4">
                <p className="text-gray-300 whitespace-pre-wrap break-words">
                  {entry.message}
                </p>
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700">
                <button
                  onClick={() => setSelectedEntry(entry)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Chi tiết
                  </span>
                </button>

                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Xóa
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredEntries.length === 0 && !loading && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-gray-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-400 mb-1">
            Không có lưu bút nào
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Không tìm thấy lưu bút nào phù hợp với từ khóa tìm kiếm"
              : "Chưa có lưu bút nào được gửi"}
          </p>
        </div>
      )}

      {/* Entry detail modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedEntry.name || "Người bạn ẩn danh"}
                </h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {selectedEntry.email && (
                <p className="text-sm text-blue-400 mb-4">
                  {selectedEntry.email}
                </p>
              )}

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                  Thông tin
                </h4>
                <div className="bg-gray-900/50 rounded-md p-3 text-gray-300 text-sm">
                  <p>
                    <span className="font-medium text-gray-400">ID:</span>{" "}
                    {selectedEntry.id}
                  </p>
                  <p>
                    <span className="font-medium text-gray-400">Ngày gửi:</span>{" "}
                    {new Date(selectedEntry.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                  Nội dung lưu bút
                </h4>
                <div className="bg-gray-900/50 rounded-md p-4 text-white whitespace-pre-wrap break-words">
                  {selectedEntry.message}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-700 flex justify-end gap-4">
                <button
                  onClick={() => {
                    handleDeleteEntry(selectedEntry.id);
                    setSelectedEntry(null);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Xóa lưu bút
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
