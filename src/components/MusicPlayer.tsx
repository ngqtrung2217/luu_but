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
    // Fetch music tracks from Supabase
    const fetchTracks = async () => {
      try {
        console.log(
          "MusicPlayer: Attempting to fetch music tracks from Supabase..."
        );

        // For debugging purposes, we'll try a simple query first
        const { error: pingError } = await supabase
          .from("music_meta")
          .select("count()", { count: "exact", head: true });

        if (pingError) {
          console.log("MusicPlayer: Database connection error:", pingError);
          return;
        }

        // Now fetch the actual tracks
        const { data, error } = await supabase.from("music_meta").select("*");

        if (error) {
          console.error(
            "MusicPlayer: Error fetching music tracks:",
            JSON.stringify(error)
          );
          toast.error("Error loading music tracks");
          return;
        }

        // Log result
        console.log(
          `MusicPlayer: Found ${data?.length || 0} music tracks in database`
        );

        if (data && data.length > 0) {
          // Shuffle the tracks for random playback
          const shuffledTracks = [...data].sort(() => Math.random() - 0.5);
          setTracks(shuffledTracks as MusicTrack[]);
          console.log("MusicPlayer: Successfully loaded tracks");
        } else {
          console.log("MusicPlayer: No music tracks found in database");
          // Even if no tracks were found, we'll update state to empty array
          setTracks([]);
        }
      } catch (err) {
        console.error("MusicPlayer: Critical error fetching tracks:", err);
        toast.error("Error connecting to music database");
      }
    };

    // Fetch tracks initially
    fetchTracks();

    // Set up an interval to check for new tracks every minute
    const intervalId = setInterval(fetchTracks, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Initialize or update the music player when tracks or current track changes
    if (tracks.length > 0 && currentTrackIndex < tracks.length) {
      const currentTrack = tracks[currentTrackIndex]; // Stop previous sound if it exists
      if (soundRef.current) {
        soundRef.current.stop();
      }

      // Create a new Howl instance for the current track
      const trackUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/songs/${currentTrack.file_path}`;

      console.log("Loading track:", currentTrack.title, "from URL:", trackUrl);

      const sound = new Howl({
        src: [trackUrl],
        html5: true,
        volume: volume,
        onend: () => {
          // Play next track when current one ends
          setCurrentTrackIndex((prevIndex) =>
            prevIndex + 1 < tracks.length ? prevIndex + 1 : 0
          );
        },
        onplay: () => {
          setIsPlaying(true);
          setDuration(sound.duration());

          // Update seek position
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
        onloaderror: (id, error) => {
          console.log("Error loading track:", currentTrack.title, error);
          // Skip to next track on error after a short delay
          setTimeout(() => {
            setCurrentTrackIndex((prevIndex) =>
              prevIndex + 1 < tracks.length ? prevIndex + 1 : 0
            );
          }, 1000);
        },
      });

      soundRef.current = sound;

      // Auto-play if it was playing before or it's the first track
      if (isPlaying || tracks.length === 1) {
        sound.play();
      }
    }

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
      }

      if (seekIntervalRef.current) {
        clearInterval(seekIntervalRef.current);
      }
    };
  }, [tracks, currentTrackIndex]);  // Update volume when it changes
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
      // Update playing state if needed
      if (isPlaying && !soundRef.current.playing()) {
        soundRef.current.play();
      } else if (!isPlaying && soundRef.current.playing()) {
        soundRef.current.pause();
      }
    }
  }, [volume, isPlaying]); // Dependencies are already included

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

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeek = parseFloat(e.target.value);
    setSeek(newSeek);

    if (soundRef.current) {
      soundRef.current.seek(newSeek);
    }
  };

  const shuffleTracks = () => {
    // Create a new shuffled array without including current playing track at the start
    const currentTrack = tracks[currentTrackIndex];
    const remainingTracks = tracks.filter((_, i) => i !== currentTrackIndex);
    const shuffled = [...remainingTracks].sort(() => Math.random() - 0.5);

    // Put current track at the beginning so it continues playing
    setTracks([currentTrack, ...shuffled]);
    setCurrentTrackIndex(0);
  };

  // Format time in MM:SS
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };
  if (tracks.length === 0) {
    // Show minimal player with a message when no tracks are available
    return (
      <motion.div
        className="fixed bottom-0 center-0 m-4 bg-gray-900/90 backdrop-blur-md border border-purple-700/50 rounded-lg shadow-lg z-50 p-3"
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
      whileHover={{ scale: 1.02 }}
    >
      {expanded ? (
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium truncate max-w-[200px] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {tracks[currentTrackIndex]?.title || "Unknown track"}
            </h3>
            <button
              onClick={() => setExpanded(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center text-xs text-gray-400 justify-between mb-1">
            <span>{formatTime(seek)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <input
            type="range"
            min="0"
            max={duration || 1}
            step="0.01"
            value={seek}
            onChange={handleSeekChange}
            className="w-full h-1 mb-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={shuffleTracks}
                className="text-gray-300 hover:text-white p-1"
                aria-label="Shuffle tracks"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z"
                  />
                  <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z" />
                </svg>
              </button>
              <button
                onClick={playPrevTrack}
                className="text-gray-300 hover:text-white p-1"
                aria-label="Previous track"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M4 4v8h1V4H4zm1 7.268A2 2 0 0 0 6.732 12H12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6.732a2 2 0 0 0-1.732 1.004V4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1v-.732z" />
                </svg>
              </button>
              <button
                onClick={togglePlayPause}
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full flex items-center justify-center"
                aria-label={isPlaying ? "Pause" : "Play"}
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
                aria-label="Next track"
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

            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="text-gray-400 mr-1"
                viewBox="0 0 16 16"
              >
                <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z" />
                <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z" />
                <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {tracks.length > 1 && (
            <p className="text-xs text-gray-500 mt-2">
              {currentTrackIndex + 1} / {tracks.length}
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePlayPause}
            className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-full shadow-lg shadow-purple-500/20 transform transition-transform hover:scale-105"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M10.804 8 5 4.633v6.734L10.804 8zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-gray-400 hover:text-white truncate max-w-[100px]"
          >
            {tracks[currentTrackIndex]?.title || "Unknown track"}
          </button>
        </div>
      )}
    </motion.div>
  );
}
