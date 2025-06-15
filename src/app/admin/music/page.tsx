"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { MusicTrack } from "@/utils/supabase";
import { motion } from "@/utils/motion";
import MusicUpload from "@/components/MusicUpload";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MusicManagement() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has admin role
    const checkAdminStatus = async () => {
      // Check if admin status is stored in localStorage
      const isAdminAuthenticated = localStorage.getItem("isAdminAuthenticated") === "true";
      
      if (isAdminAuthenticated) {
        setIsAdmin(true);
        fetchTracks();
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (data) {
        setIsAdmin(true);
        fetchTracks();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAdminStatus();
    
    // Cleanup any playing audio on unmount
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
      }
    };
  }, []);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      
      // Try direct Supabase query first
      const { data, error } = await supabase
        .from("music_meta")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("MusicManagement: Error fetching tracks:", error);
        throw error;
      }
      
      console.log(`MusicManagement: Loaded ${data?.length || 0} tracks`);
      setTracks(data as MusicTrack[]);
      setError(null);
    } catch (err) {
      console.error("MusicManagement: Error fetching tracks", err);
      setError("Không thể tải danh sách nhạc");
      
      // Try API fallback
      try {
        const response = await fetch('/api/music-tracks');
        const { data } = await response.json();
        
        if (data && Array.isArray(data) && data.length > 0) {
          console.log(`MusicManagement: Loaded ${data.length} tracks from API`);
          setTracks(data);
          setError(null);
        }
      } catch (apiErr) {
        console.error("MusicManagement: API fallback failed", apiErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (track: MusicTrack) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài "${track.title}"?`)) {
      return;
    }

    try {
      // Stop playback if this is the current track
      if (playingTrackId === track.id) {
        if (currentAudio) {
          currentAudio.pause();
        }
        setPlayingTrackId(null);
        setCurrentAudio(null);
      }

      // First delete the file from storage
      const { error: storageError } = await supabase
        .storage
        .from("songs")
        .remove([track.file_path]);

      if (storageError) {
        console.error("Error deleting file:", storageError);
        toast.warning("File xóa không thành công, nhưng đã xóa metadata");
      }

      // Then delete the metadata
      const { error: dbError } = await supabase
        .from("music_meta")
        .delete()
        .eq("id", track.id);

      if (dbError) throw dbError;

      // Update UI
      setTracks(tracks.filter(t => t.id !== track.id));
      toast.success(`Đã xóa "${track.title}"`);
    } catch (err: any) {
      console.error("Error deleting track:", err);
      toast.error(`Lỗi: ${err.message}`);
    }
  };

  const handlePlay = async (track: MusicTrack) => {
    try {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
      }
      
      // Get the public URL
      const { data } = await supabase
        .storage
        .from("songs")
        .getPublicUrl(track.file_path);
      
      if (!data?.publicUrl) {
        throw new Error("Không thể lấy đường dẫn file");
      }
      
      // Create and play new audio
      const audio = new Audio(data.publicUrl);
      audio.addEventListener("ended", () => {
        setPlayingTrackId(null);
      });
      
      audio.addEventListener("error", () => {
        toast.error(`Không thể phát "${track.title}"`);
        setPlayingTrackId(null);
      });
      
      audio.play()
        .then(() => {
          setCurrentAudio(audio);
          setPlayingTrackId(track.id);
        })
        .catch(err => {
          console.error("Error playing audio:", err);
          toast.error(`Không thể phát "${track.title}"`);
        });
    } catch (err) {
      console.error("Error setting up audio:", err);
      toast.error("Không thể phát nhạc");
    }
  };

  const handleStop = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      setCurrentAudio(null);
    }
    setPlayingTrackId(null);
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

  return (
    <div className="container mx-auto py-8 px-4">
      <ToastContainer position="top-right" theme="dark" />
      
      {/* Header with navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý Nhạc</h1>
          <p className="text-gray-400">Tải lên và quản lý nhạc nền</p>
        </div>
        
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link href="/admin" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/messages" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors">
            Lưu bút
          </Link>
        </div>
      </div>
      
      {/* Upload section */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Tải nhạc mới</h2>
        <MusicUpload onUploadSuccess={fetchTracks} />
      </div>
      
      {/* Music list */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Danh sách nhạc</h2>
          
          <button
            onClick={fetchTracks}
            className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span>Làm mới</span>
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="text-gray-400 mt-4">Đang tải danh sách nhạc...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-500/20 p-4 rounded-md text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchTracks}
              className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md mt-2 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && tracks.length === 0 && (
          <div className="text-center py-8 bg-gray-900/40 rounded-md">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <h3 className="text-xl font-medium text-gray-400 mb-2">Chưa có bài nhạc nào</h3>
            <p className="text-gray-500 mb-4">Hãy tải lên bài nhạc đầu tiên của bạn</p>
          </div>
        )}

        {!loading && !error && tracks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-sm font-medium text-gray-400 uppercase">Tên bài hát</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-400 uppercase">Ngày tạo</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-400 uppercase">Thao tác</th>
                </tr>
              </thead>
              
              <tbody>
                {tracks.map((track) => (
                  <motion.tr 
                    key={track.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-4 font-medium text-white">
                      {track.title}
                    </td>
                    <td className="px-4 py-4 text-gray-400">
                      {new Date(track.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-3">
                        {playingTrackId === track.id ? (
                          <button
                            onClick={handleStop}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePlay(track)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(track)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
