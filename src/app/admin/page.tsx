"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminPanel from "@/components/AdminPanel";
import AdminLogin from "@/components/AdminLogin";
import MusicUpload from "@/components/MusicUpload";
import { ToastContainer } from "react-toastify";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "@/utils/supabase";
import { GuestbookEntry, MusicTrack } from "@/utils/supabase";

export default function AdminPage() {
  const { session, isAdmin, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [localAdmin, setLocalAdmin] = useState(false);
  const [recentEntries, setRecentEntries] = useState<GuestbookEntry[]>([]);
  const [recentTracks, setRecentTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Check localStorage directly
    const isAdminFromLocalStorage =
      localStorage.getItem("isAdminAuthenticated") === "true";
    setLocalAdmin(isAdminFromLocalStorage);
    
    if (isAdmin || isAdminFromLocalStorage) {
      fetchRecentData();
    }
  }, [isAdmin]);
  
  const fetchRecentData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent guestbook entries
      const { data: entriesData, error: entriesError } = await supabase
        .from("guestbook")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
        
      if (entriesError) throw entriesError;
      setRecentEntries(entriesData || []);
      
      // Fetch recent music tracks
      const { data: tracksData, error: tracksError } = await supabase
        .from("music")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
        
      if (tracksError) throw tracksError;
      setRecentTracks(tracksData || []);
      
    } catch (error) {
      console.error("Error fetching recent data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="container mx-auto">        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Admin Dashboard
        </h1>
          {(session || localAdmin) && (isAdmin || localAdmin) && (
          <div className="flex justify-center space-x-4 mb-10">
            <Link 
              href="/admin/messages" 
              className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-2 rounded-md transition-colors"
            >
              Quản lý Lưu bút
            </Link>
            <Link 
              href="/admin/music" 
              className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
            >
              Quản lý Nhạc
            </Link>
          </div>
        )}
        {session || localAdmin ? (
          isAdmin || localAdmin ? (
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-4">Lưu bút gần đây</h2>
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : recentEntries.length > 0 ? (
                    <div className="space-y-4">
                      {recentEntries.map(entry => (
                        <div key={entry.id} className="bg-gray-700/50 p-4 rounded-md">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{entry.name}</h3>
                            <span className="text-xs text-gray-400">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mt-2 line-clamp-2">{entry.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-8">Không có lưu bút nào</p>
                  )}
                  
                  <div className="mt-4 text-center">
                    <Link 
                      href="/admin/messages" 
                      className="inline-block bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Xem tất cả lưu bút
                    </Link>
                  </div>                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-4">Quản lý nhạc</h2>
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-white mb-3">Tải nhạc lên</h3>
                        <MusicUpload onUploadSuccess={() => fetchRecentData()} />
                      </div>
                      
                      <h3 className="text-lg font-medium text-white mb-3">Nhạc gần đây</h3>
                      {recentTracks.length > 0 ? (
                        <div className="space-y-2">
                          {recentTracks.map(track => (
                            <div key={track.id} className="bg-gray-700/50 p-3 rounded-md flex justify-between items-center">
                              <span className="truncate">{track.title}</span>
                              <span className="text-xs text-gray-400">
                                {new Date(track.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-400 py-4">Chưa có bài nhạc nào</p>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 text-center">
                    <Link 
                      href="/admin/music"                      className="inline-block bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Quản lý tất cả nhạc
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-red-500/20 p-6 rounded-lg border border-red-500 text-center">
                <h2 className="text-xl font-bold text-red-400 mb-2">
                  Không có quyền truy cập
                </h2>
                <p className="text-gray-300">
                  Tài khoản của bạn không có quyền admin. Vui lòng đăng nhập với
                  tài khoản admin.
                </p>
              </div>
            </div>
          )
        ) : (
          <AdminLogin />
        )}
      </div>
    </div>
  );
}
