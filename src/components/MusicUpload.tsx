"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { toast } from "react-toastify";
import { MusicTrack } from "@/utils/supabase";
import { motion } from "@/utils/motion";

interface MusicUploadProps {
  onUploadSuccess?: () => void;
}

export default function MusicUpload({ onUploadSuccess }: MusicUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch existing tracks on component mount
  useEffect(() => {
    fetchTracks();
  }, []);  // Fetch existing tracks
  const fetchTracks = async () => {
    setLoading(true);
    try {
      console.log("MusicUpload: Fetching tracks from music_meta table...");
      
      // Use an API route instead to bypass client-side RLS issues
      // or use simpler query that doesn't trigger the recursion issue
      const { data, error } = await supabase
        .from("music_meta")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50); // Limit the number of results for better performance

      if (error) {
        console.error(
          "MusicUpload: Error fetching tracks:",
          JSON.stringify(error)
        );
        // Don't show detailed errors to users
        toast.error("Không thể lấy danh sách nhạc. Vui lòng thử lại sau.");
        
        // Fallback: still try to show some tracks even if there's an error
        if (data) {
          console.log("MusicUpload: Using partial data despite error");
          setTracks(data as MusicTrack[]);
        }
        return;
      }

      console.log("MusicUpload: Fetched tracks:", data?.length || 0);
      setTracks(data as MusicTrack[]);
    } catch (error: any) {
      console.error("MusicUpload: Exception fetching tracks:", error);
      toast.error("Có lỗi xảy ra khi lấy danh sách nhạc");
      
      // Try to recover by fetching without authentication
      try {
        const { data } = await fetch('/api/music-tracks').then(res => res.json());
        if (data && Array.isArray(data)) {
          setTracks(data as MusicTrack[]);
        }
      } catch (fallbackError) {
        console.error("MusicUpload: Fallback fetch also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };
  // Upload music file to Supabase Storage
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title.trim()) {
      toast.error("Vui lòng chọn một file nhạc và nhập tiêu đề");
      return;
    }

    setIsUploading(true);

    try {
      console.log("MusicUpload: Starting file upload...");
      
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Try to upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("songs")
        .upload(filePath, file);

      if (uploadError) {
        console.error("MusicUpload: Storage upload error:", uploadError);
        throw uploadError;
      }

      console.log("MusicUpload: File uploaded successfully, path:", filePath);
      
      // Try to get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      console.log("MusicUpload: Current user ID:", userId || "anonymous");

      // Add metadata to database (with created_by if available)
      const metaData: any = { 
        title, 
        file_path: filePath 
      };
      
      // Add the user ID if available
      if (userId) {
        metaData.created_by = userId;
      }

      // Try using the API route instead of direct database access
      try {
        const response = await fetch('/api/music-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metaData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Unknown error");
        }
        
        console.log("MusicUpload: Successfully added metadata via API");
      } catch (apiError: any) {
        console.error("MusicUpload: API route error:", apiError);
        
        // Fallback to direct insertion if API fails
        console.log("MusicUpload: Trying direct insertion fallback");
        const { error: dbError } = await supabase
          .from("music_meta")
          .insert([metaData]);

        if (dbError) {
          console.error("MusicUpload: Database insertion error:", dbError);
          throw dbError;
        }
      }      toast.success("Tải lên nhạc thành công!");
      setFile(null);
      setTitle("");
      
      // Call the onUploadSuccess callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      setTitle("");
      fetchTracks(); // Refresh the track list
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete a track
  const handleDelete = async (track: MusicTrack) => {
    if (window.confirm(`Are you sure you want to delete "${track.title}"?`)) {
      try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from("songs")
          .remove([track.file_path]);

        if (storageError) throw storageError;

        // Delete from database
        const { error: dbError } = await supabase
          .from("music_meta")
          .delete()
          .eq("id", track.id);

        if (dbError) throw dbError;

        toast.success("Track deleted successfully!");
        fetchTracks(); // Refresh the track list
      } catch (error: any) {
        toast.error(`Delete failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-lg border border-gray-700 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Music Management</h2>

      <form onSubmit={handleUpload} className="mb-8">
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Song Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter song title"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="file"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            MP3 File
          </label>
          <input
            type="file"
            id="file"
            accept="audio/mp3,audio/*"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          />
          <p className="mt-1 text-sm text-gray-400">
            Upload MP3 files only (max 10MB)
          </p>
        </div>

        <button
          type="submit"
          disabled={isUploading || !file || !title.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isUploading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </span>
          ) : (
            "Upload Song"
          )}
        </button>
      </form>

      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Music Library</h3>

        <button
          onClick={fetchTracks}
          className="mb-4 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm"
        >
          Refresh List
        </button>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading tracks...</p>
          </div>
        ) : tracks.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No music tracks available.
          </p>
        ) : (
          <div className="space-y-3">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-white">{track.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(track.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(track)}
                  className="text-red-400 hover:text-red-300 p-1"
                  aria-label="Delete track"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
