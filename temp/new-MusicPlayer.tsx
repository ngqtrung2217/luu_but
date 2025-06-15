"use client";

import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { supabase } from "@/utils/supabase";
import { MusicTrack } from "@/utils/supabase";
import { motion } from "@/utils/motion";
import { toast } from "react-toastify";

export default function MusicPlayer() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [expanded, setExpanded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [seek, setSeek] = useState(0);
  const soundRef = useRef<Howl | null>(null);
  const seekIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        console.log(
          "MusicPlayer: Checking connection to Supabase:",
          process.env.NEXT_PUBLIC_SUPABASE_URL
        );

        // Fetch music tracks
        const { data, error } = await supabase
          .from("music_meta")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("MusicPlayer: Database error:", error);
          toast.error("Could not load music tracks");
          return;
        }

        console.log(
          `MusicPlayer: Found ${data?.length || 0} tracks in database`
        );

        if (data && data.length > 0) {
          // Shuffle the tracks
          const shuffledTracks = [...data].sort(() => Math.random() - 0.5);
          setTracks(shuffledTracks as MusicTrack[]);
        } else {
          // Even if no tracks, still update state with empty array
          setTracks([]);
        }
      } catch (err) {
        console.error("MusicPlayer: Fatal error:", err);
        toast.error("Music player connection issue");
      }
    };

    // Initial fetch
    fetchTracks();

    // Refresh every minute
    const intervalId = setInterval(fetchTracks, 60000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (tracks.length > 0 && currentTrackIndex < tracks.length) {
      const currentTrack = tracks[currentTrackIndex];

      // Stop previous track
      if (soundRef.current) {
        soundRef.current.stop();
      }

      const trackUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/songs/${currentTrack.file_path}`;
      console.log("Loading track:", currentTrack.title, trackUrl);

      const sound = new Howl({
        src: [trackUrl],
        html5: true,
        volume: volume,
        onend: () => {
          setCurrentTrackIndex((prevIndex) =>
            prevIndex + 1 < tracks.length ? prevIndex + 1 : 0
          );
        },
        onplay: () => {
          setIsPlaying(true);
          setDuration(sound.duration());

          if (seekIntervalRef.current) {
            clearInterval(seekIntervalRef.current);
          }

          seekIntervalRef.current = setInterval(() => {
            setSeek(sound.seek());
          }, 1000);
        },
        onpause: () => {
          setIsPlaying(false);
          if (seekIntervalRef.current) {
            clearInterval(seekIntervalRef.current);
          }
        },
        onstop: () => {
          setIsPlaying(false);
          if (seekIntervalRef.current) {
            clearInterval(seekIntervalRef.current);
          }
        },
        onloaderror: () => {
          console.error("Failed to load track:", currentTrack.title);
          toast.error(`Cannot play "${currentTrack.title}"`);

          setTimeout(() => {
            setCurrentTrackIndex((prevIndex) =>
              prevIndex + 1 < tracks.length ? prevIndex + 1 : 0
            );
          }, 1000);
        },
      });

      soundRef.current = sound;

      if (isPlaying || tracks.length === 1) {
        sound.play();
      }
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
      if (seekIntervalRef.current) {
        clearInterval(seekIntervalRef.current);
      }
    };
  }, [tracks, currentTrackIndex, volume]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const playNextTrack = () => {
    setCurrentTrackIndex((prevIndex) =>
      prevIndex + 1 < tracks.length ? prevIndex + 1 : 0
    );
  };

  const playPrevTrack = () => {
    setCurrentTrackIndex((prevIndex) =>
      prevIndex - 1 >= 0 ? prevIndex - 1 : tracks.length - 1
    );
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSeek(value);
    if (soundRef.current) {
      soundRef.current.seek(value);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (tracks.length === 0) {
    return (
      <motion.div
        className="fixed bottom-0 right-0 m-4 bg-gray-900/90 backdrop-blur-md border border-purple-700/50 rounded-lg shadow-lg z-50 p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-gray-400 text-center py-1 px-2 text-sm">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <span>Đang tải nhạc...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`fixed bottom-0 right-0 m-4 bg-gray-900/90 backdrop-blur-md border border-purple-700/50 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        expanded ? "p-4 w-96" : "p-3"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm truncate">
            {tracks[currentTrackIndex]?.title || "Unknown Track"}
          </h3>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-white ml-3"
        >
          {expanded ? (
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          ) : (
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
                d="M5 15l7-7 7 7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Seek bar */}
      <div
        className={`transition-all duration-500 overflow-hidden ${
          expanded ? "h-auto opacity-100 mb-4" : "h-0 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>{formatTime(seek)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max={duration}
          step="0.01"
          value={seek}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={playPrevTrack}
            className="text-gray-300 hover:text-white p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M4 4v8h1V4H4zm1 7.268A2 2 0 0 1 7.732 12H12a2 2 0 0 1 2 2v-8a2 2 0 0 1-2 2H7.732a2 2 0 0 1-1.732-1.004V4a1 1 0 0 1-1 1v6a1 1 0 0 1 1 1v-.732z" />
            </svg>
          </button>

          <button
            onClick={togglePlayPause}
            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full"
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z" />
              </svg>
            )}
          </button>

          <button
            onClick={playNextTrack}
            className="text-gray-300 hover:text-white p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M12.5 4v8h-1V4h1zm-1 7.268A2 2 0 0 1 9.268 12H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.268a2 2 0 0 1 1.732 1.004V4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1v-.732z" />
            </svg>
          </button>
        </div>

        {/* Volume */}
        <div
          className={`flex items-center space-x-1 transition-all duration-500 ${
            expanded ? "opacity-100 w-28" : "opacity-0 w-0 overflow-hidden"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Volume icon when collapsed */}
        <button
          onClick={() => setExpanded(true)}
          className={`text-gray-400 hover:text-white ${
            expanded ? "hidden" : "block"
          }`}
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
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
