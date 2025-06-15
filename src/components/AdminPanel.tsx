"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { GuestbookEntry } from "@/utils/supabase";
import { motion } from "@/utils/motion";
import MusicUpload from "./MusicUpload";
import Header from "./Header";

export default function AdminPanel() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    // Check if user has admin role
    const checkAdminStatus = async () => {
      // Check if admin status is stored in localStorage
      const isAdminAuthenticated =
        localStorage.getItem("isAdminAuthenticated") === "true";
      console.log(
        "AdminPanel - isAdminAuthenticated from localStorage:",
        isAdminAuthenticated
      );

      if (isAdminAuthenticated) {
        console.log("AdminPanel - Setting isAdmin to true from localStorage");
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
      }

      // In a real app, we'd check for admin role in the user's metadata or claims
      // This is simplified for demo purposes
      const { data, error } = await supabase
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
  }, []);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("luubut")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setEntries(data as GuestbookEntry[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 p-6 rounded-lg border border-red-500 text-center">
        <h2 className="text-xl font-bold text-red-400 mb-2">Lỗi</h2>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Header
        title="Quản lý Lưu bút"
        subtitle="Trang quản lý dành cho admin"
        showBackground={false}
      />

      {/* Music Upload Section */}
      <div className="mb-12 bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-purple-700/30 shadow-lg">
        <h2 className="text-2xl font-bold text-purple-400 mb-6">
          Quản lý Nhạc
        </h2>
        <MusicUpload />
      </div>

      {/* Guestbook Entries Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-blue-400 mb-6">
          Lưu Bút Đã Nhận
        </h2>

        {entries.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Chưa có lưu bút nào được gửi.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-lg border border-gray-700 shadow-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-purple-400">
                    {entry.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {entry.message}
                </p>
                {entry.email && (
                  <p className="mt-3 text-xs text-gray-500">
                    Email: {entry.email}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
