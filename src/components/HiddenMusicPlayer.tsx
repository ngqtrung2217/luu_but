"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import { supabase } from "@/utils/supabase";
import { MusicTrack } from "@/utils/supabase";
import { motion, AnimatePresence } from "@/utils/motion";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function HiddenMusicPlayer() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play by default
  const [volume, setVolume] = useState(0.5);
  const [expanded, setExpanded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [seek, setSeek] = useState(0);
  const [loading, setLoading] = useState(true);
  // Error state is only set but not used in rendering
  const [, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false); // Initially hidden
  const soundRef = useRef<Howl | null>(null);
  const seekIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch music tracks on component mount
  useEffect(() => {
    fetchTracks();

    // Set up periodic refresh every 5 minutes
    const refreshInterval = setInterval(fetchTracks, 5 * 60 * 1000);

    // Add keyboard listener for player visibility toggle
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle player visibility with 'M' key
      if (e.key === "m" || e.key === "M") {
        setIsVisible((prev) => !prev);
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(refreshInterval);
      stopAndCleanup();      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch tracks from Supabase or API fallback
  const fetchTracks = async () => {
    try {
      console.log("MusicPlayer: Fetching tracks...");
      setLoading(true);

      // Try API endpoint first (more reliable)
      try {
        const response = await fetch("/api/music-tracks");
        const { data: apiData } = await response.json();

        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          console.log(`MusicPlayer: Loaded ${apiData.length} tracks from API`);
          setTracks(apiData);
          setError(null);
          setLoading(false);
          return;        }      } catch {
        // Error is intentionally ignored
        console.log(
          "MusicPlayer: API fallback failed, trying Supabase directly"
        );
      }

      // If API fails, try direct Supabase query
      const { data, error } = await supabase
        .from("music_meta")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Silently log the error but don't show to user
        console.error("MusicPlayer: Supabase error:", error);
        // Don't throw or display error to user
        setLoading(false);
        return;
      }

      if (data) {
        console.log(`MusicPlayer: Loaded ${data.length} tracks from Supabase`);
        setTracks(data);
      } else {
        setTracks([]);
      }

      setError(null);
    } catch (err) {
      console.error("MusicPlayer: Error fetching tracks:", err);
      // Don't show errors to user
    } finally {
      setLoading(false);
    }
  };

  // Load and play a track
  useEffect(() => {
    if (tracks.length === 0) return;

    const loadTrack = async () => {
      try {
        stopAndCleanup();

        const track = tracks[currentTrackIndex];
        console.log(`MusicPlayer: Loading track "${track.title}"`);

        // Try multiple sources for better compatibility
        // 1. Custom API proxy (handles CORS, streaming)
        // 2. Direct Supabase URL
        const apiUrl = `/api/music-play?path=${encodeURIComponent(
          track.file_path
        )}`;
        const alternativeUrls = [];

        try {
          // Get direct URL from Supabase as fallback
          const { data } = await supabase.storage
            .from("songs")
            .getPublicUrl(track.file_path);

          if (data && data.publicUrl) {
            alternativeUrls.push(data.publicUrl);
          }
        } catch (e) {
          console.log("Failed to get alternative URLs", e);
        }

        // Combine all possible sources
        const sources = [apiUrl, ...alternativeUrls];
        console.log(`MusicPlayer: Trying ${sources.length} possible sources`);

        // Create new Howl instance with multiple fallback sources
        const sound = new Howl({
          src: sources,
          html5: true,
          format: ["mp3", "wav", "aac", "m4a", "ogg"],
          volume: volume,
          preload: true, // Ensure preloading
          onplay: () => {
            setIsPlaying(true);
            startSeekInterval();
            setError(null); // Clear any errors when successfully playing
          },
          onpause: () => {
            setIsPlaying(false);
            stopSeekInterval();
          },
          onstop: () => {
            setIsPlaying(false);
            stopSeekInterval();
          },
          onend: () => {
            playNextTrack();
          },
          onload: () => {
            setDuration(sound.duration());
            setError(null); // Clear errors on successful load
          },
          onloaderror: async (_, err) => {
            console.error(
              `MusicPlayer: All sources failed for "${track.title}"`,
              err
            );

            // Don't show error toast, just quietly move to next track
            // This creates a better user experience by avoiding error popups
            console.log("Moving to next track automatically");
            playNextTrack();
          },
        });

        soundRef.current = sound;
        setSeek(0);

        // Auto-play
        sound.play();
      } catch (err) {
        console.error("MusicPlayer: Error in loadTrack", err);

        // Try next track after a short delay
        setTimeout(playNextTrack, 1500);
      }
    };    loadTrack();
  }, [tracks, currentTrackIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update volume when changed
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  }, [volume]);

  // Clean up function
  const stopAndCleanup = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop();
    }

    if (seekIntervalRef.current) {
      clearInterval(seekIntervalRef.current);
      seekIntervalRef.current = null;
    }
  }, []);

  // Play next track
  const playNextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  }, [tracks]);  // Stop seek interval
  const stopSeekInterval = useCallback(() => {
    if (seekIntervalRef.current) {
      clearInterval(seekIntervalRef.current);
      seekIntervalRef.current = null;
    }  }, []);

  // Start seek interval
  const startSeekInterval = useCallback(() => {
    stopSeekInterval();
    seekIntervalRef.current = setInterval(() => {
      if (soundRef.current) {
        setSeek(soundRef.current.seek());
      }
    }, 1000);
  }, [stopSeekInterval]);

  // Player controls
  const togglePlay = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const playPreviousTrack = () => {
    const newIndex =
      currentTrackIndex > 0 ? currentTrackIndex - 1 : tracks.length - 1;
    setCurrentTrackIndex(newIndex);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (soundRef.current) {
      soundRef.current.seek(value);
      setSeek(value);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Format time function
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentTrack = tracks[currentTrackIndex];

  // If player is not visible, return null to hide it completely
  if (!isVisible) {
    return null;
  }

  // Only render player UI when visible
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Collapsed player */}
      <AnimatePresence>
        {!expanded && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-gray-800/80 backdrop-blur-lg rounded-full p-2 shadow-lg flex items-center gap-3 border border-gray-700"
          >
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 011.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={toggleExpanded}
              className="text-white text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-1">
                  <svg
                    className="animate-spin w-3 h-3"
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
                  Nhạc nền
                </span>
              ) : tracks.length === 0 ? (
                "Nhạc nền"
              ) : (
                currentTrack?.title || "Nhạc nền"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded player */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg max-w-xs border border-gray-700"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-white">Nhạc Nền</h3>
              <button
                onClick={toggleExpanded}
                className="text-gray-400 hover:text-white"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-2 mb-3">
              <div className="text-sm font-medium mb-1 flex justify-between">
                <span>{currentTrack?.title || "Không có bài hát"}</span>
                <span className="text-gray-400">
                  {formatTime(seek)} / {formatTime(duration)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={duration || 1}
                value={seek}
                onChange={handleSeekChange}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <button
                onClick={playPreviousTrack}
                className="text-gray-300 hover:text-white"
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center transition-colors shadow-lg"
              >
                {isPlaying ? (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={playNextTrack}
                className="text-gray-300 hover:text-white"
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center mb-4">
              <svg
                className="w-5 h-5 text-gray-400 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="ml-2">{Math.round(volume * 100)}%</div>
            </div>

            {/* Track list section */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">
                {tracks.length} bài hát
              </div>
              <div className="flex text-xs">
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                  Ẩn
                </button>
              </div>
            </div>

            <div className="mt-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {tracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => setCurrentTrackIndex(index)}
                  className={`w-full text-left py-1 px-2 rounded text-sm truncate ${
                    currentTrackIndex === index
                      ? "bg-purple-900/40 text-purple-300"
                      : "hover:bg-gray-700/50 text-gray-300"
                  }`}
                >
                  {track.title}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
