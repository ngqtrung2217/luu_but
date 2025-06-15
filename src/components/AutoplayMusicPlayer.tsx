"use client";

import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { supabase } from "@/utils/supabase";
import { MusicTrack } from "@/utils/supabase";
import { motion, AnimatePresence } from "@/utils/motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePathname } from "next/navigation";

export default function AutoplayMusicPlayer() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play by default
  const [volume, setVolume] = useState(0.5);
  const [expanded, setExpanded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [seek, setSeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false); // Track if a fade effect is in progress
  const [activeVisualEffect, setActiveVisualEffect] = useState<string | null>(null); // Current active visual effect
  const soundRef = useRef<Howl | null>(null);
  const nextSoundRef = useRef<Howl | null>(null); // Store the preloaded next track
  const seekIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoplayAttempted = useRef<boolean>(false);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer for auto-fade effect
  const pathname = usePathname(); // Get the current pathname to conditionally hide effects
  
  // Check if we should hide visual effects on certain pages
  const shouldHideVisualEffects = () => {
    const hiddenPaths = ['/admin', '/admin/messages', '/admin/music'];
    return hiddenPaths.some(path => pathname?.startsWith(path));
  };

  // Fetch music tracks on component mount
  useEffect(() => {
    fetchTracks();
    
    // Set up periodic refresh every 5 minutes
    const refreshInterval = setInterval(fetchTracks, 5 * 60 * 1000);
    
    return () => {
      clearInterval(refreshInterval);
      stopAndCleanup();
    };
  }, []);

  // Handle autoplay restrictions
  useEffect(() => {
    // Try to autoplay as soon as possible
    const attemptAutoplay = () => {
      if (soundRef.current && !soundRef.current.playing() && !autoplayAttempted.current) {
        console.log('Attempting autoplay after user interaction');
        soundRef.current.play();
        autoplayAttempted.current = true;
      }
    };

    // Add event listeners to enable autoplay after user interaction
    const handleUserInteraction = () => {
      attemptAutoplay();
      // Clean up event listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };

    // Add various event listeners for different types of user interactions
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('scroll', handleUserInteraction);

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);
  
  // Shuffle function to randomize track order
  const shuffleTracks = (tracksList: MusicTrack[]) => {
    console.log("Shuffling tracks for random playback");
    return [...tracksList].sort(() => Math.random() - 0.5);
  };
  
  // Fetch tracks from Supabase or API fallback
  const fetchTracks = async () => {
    try {
      console.log("MusicPlayer: Fetching tracks...");
      setLoading(true);
      
      // Try API endpoint first (more reliable)
      try {
        const response = await fetch('/api/music-tracks');
        const { data: apiData } = await response.json();
        
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          console.log(`MusicPlayer: Loaded ${apiData.length} tracks from API`);
          // Shuffle tracks before setting them
          const shuffledTracks = shuffleTracks(apiData);
          setTracks(shuffledTracks);
          setError(null);
          setLoading(false);
          return;
        }
      } catch (apiErr) {
        console.log("MusicPlayer: API fallback failed, trying Supabase directly");
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
        // Shuffle tracks before setting them
        const shuffledTracks = shuffleTracks(data);
        setTracks(shuffledTracks);
        setError(null);
      }
    } catch (err) {
      console.error("MusicPlayer: Error fetching tracks:", err);
      // Don't show error to user
    } finally {
      setLoading(false);
    }
  };

  // Preload a random track to prepare for smooth transitions
  const preloadNextTrack = async () => {
    if (tracks.length <= 1) return; // No need to preload if we only have 0 or 1 track
    
    // Choose a random track that's different from the current one
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * tracks.length);
    } while (randomIndex === currentTrackIndex && tracks.length > 1);
    
    const nextTrack = tracks[randomIndex];
    
    try {
      // Build the sources array just like in loadTrack
      const apiUrl = `/api/music-play?path=${encodeURIComponent(nextTrack.file_path)}`;
      let alternativeUrls: string[] = [];
      
      try {
        // Get direct URL from Supabase as fallback
        const { data } = await supabase.storage
          .from("songs")
          .getPublicUrl(nextTrack.file_path);
          
        if (data && data.publicUrl) {
          alternativeUrls.push(data.publicUrl);
        }
      } catch (e) {
        console.log("Failed to get alternative URLs for preloading", e);
      }
      
      // Create but don't start playing the next track
      const nextSound = new Howl({
        src: [apiUrl, ...alternativeUrls],
        html5: true,
        format: ['mp3', 'wav', 'aac', 'm4a', 'ogg'],
        preload: true,
        volume: 0, // Start with volume at 0
        autoplay: false
      });
      
      nextSoundRef.current = nextSound;
    } catch (err) {
      console.error("Error preloading next track:", err);
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
        
        // Check if we have a preloaded next track that matches the current track
        let sound: Howl;
        
        if (nextSoundRef.current) {
          // Use the preloaded track
          sound = nextSoundRef.current;
          nextSoundRef.current = null;
        } else {
          // Create a new sound instance
          // Try multiple sources for better compatibility
          const apiUrl = `/api/music-play?path=${encodeURIComponent(track.file_path)}`;
          let alternativeUrls: string[] = [];
          
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
          sound = new Howl({
            src: sources,
            html5: true,
            format: ['mp3', 'wav', 'aac', 'm4a', 'ogg'],
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
              fadeToNextTrack();
            },
            onload: () => {
              setDuration(sound.duration());
              setError(null); // Clear errors on successful load
              
              // After loading current track, preload next track
              preloadNextTrack();
            },
            onloaderror: async (_, err) => {
              console.error(`MusicPlayer: All sources failed for "${track.title}"`, err);
              
              // Don't show error toast, just quietly move to next track
              console.log("Moving to next track automatically");
              fadeToNextTrack();
            },
          });
        }
        
        soundRef.current = sound;
        setSeek(0);
        
        // Auto-play if it was already playing or initial load
        if (isPlaying) {
          try {
            sound.play();
            console.log("Autoplay started successfully");
          } catch (playErr) {
            console.error("Autoplay blocked by browser:", playErr);
            // We'll rely on the user interaction handlers to start playback
          }
        }
      } catch (err) {
        console.error("MusicPlayer: Error in loadTrack", err);
        
        // Try next track after a short delay
        setTimeout(fadeToNextTrack, 1500);
      }
    };
    
    loadTrack();
  }, [currentTrackIndex, tracks]);

  // Update volume when changed
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.volume(volume);
    }
  }, [volume]);

  // Clean up function
  const stopAndCleanup = () => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
      soundRef.current = null;
    }
    stopSeekInterval();
  };

  // Start tracking audio position
  const startSeekInterval = () => {
    stopSeekInterval();
    
    seekIntervalRef.current = setInterval(() => {
      if (soundRef.current && soundRef.current.playing()) {
        setSeek(soundRef.current.seek());
      }
    }, 1000);
  };

  // Stop tracking audio position
  const stopSeekInterval = () => {
    if (seekIntervalRef.current) {
      clearInterval(seekIntervalRef.current);
      seekIntervalRef.current = null;
    }
  };

  // Handle play/pause toggle
  const togglePlay = () => {
    if (!soundRef.current) return;
    
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  // Play a random track (for shuffle mode)
  const playRandomTrack = () => {
    if (tracks.length <= 1) {
      return; // No need to shuffle with 0 or 1 tracks
    }
    
    // Generate a random index that is different from current track
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } while (nextIndex === currentTrackIndex && tracks.length > 1);
    
    setCurrentTrackIndex(nextIndex);
  };

  // Play next track (now randomized instead of sequential)
  const playNextTrack = () => {
    // Use random selection instead of sequential
    playRandomTrack();
  };

  // Play previous track
  const playPrevTrack = () => {
    // Also make previous track random for consistent shuffle experience
    playRandomTrack();
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
  };

  // Handle seek change
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeek = parseFloat(e.target.value);
    setSeek(newSeek);
    
    if (soundRef.current) {
      soundRef.current.seek(newSeek);
    }
  };

  // Toggle expanded view
  const toggleExpanded = () => setExpanded(!expanded);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current track
  const currentTrack = tracks.length > 0 ? tracks[currentTrackIndex] : null;

  // Fade to next track with smooth volume transition
  const fadeToNextTrack = () => {
    if (!soundRef.current || isFading || !isPlaying) return;
    
    setIsFading(true);
    const originalVolume = soundRef.current.volume();
    const fadeSteps = 60; // Number of steps for fade effect (increased for smoother 6 second fade)
    const fadeInterval = 100; // 100ms * 60 steps = 6 seconds fade
    let step = 0;
    
    // Choose a random visual effect when changing tracks
    const effects = ['lines', 'circles', 'galaxy', 'particles', 'waves'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    setActiveVisualEffect(randomEffect);
    
    // Create fade out effect
    const fadeOut = setInterval(() => {
      step++;
      
      if (soundRef.current) {
        const newVolume = originalVolume * (1 - step / fadeSteps);
        soundRef.current.volume(newVolume);
      }
      
      if (step >= fadeSteps) {
        clearInterval(fadeOut);
        
        // Now play next track
        playNextTrack();
        
        // Clear visual effect after a delay
        setTimeout(() => {
          setActiveVisualEffect(null);
          setIsFading(false);
        }, 4000); // Keep effect visible a bit longer after fade
      }
    }, fadeInterval);
  };

  // Shuffle currently loaded tracks
  const shuffleCurrentTracks = () => {
    if (tracks.length <= 1) return;
    
    // Keep current track but shuffle all others
    const currentTrack = tracks[currentTrackIndex];
    const otherTracks = tracks.filter((_, i) => i !== currentTrackIndex);
    const shuffledOthers = shuffleTracks(otherTracks);
    
    // Set current track as first in list, followed by shuffled others
    setTracks([currentTrack, ...shuffledOthers]);
    setCurrentTrackIndex(0);
    toast.info("Danh sách phát đã được xáo trộn", { 
      autoClose: 2000,
      hideProgressBar: true
    });
  };

  // Visual effect components
  const renderVisualEffect = () => {
    if (!activeVisualEffect || shouldHideVisualEffects()) return null;
    
    // Effect container styles
    const containerStyle = "fixed inset-0 pointer-events-none z-40 overflow-hidden";
    
    switch (activeVisualEffect) {
      case 'lines':
        return (
          <div className={containerStyle}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={`line-${i}`}
                  initial={{ 
                    x: Math.random() * 100 - 50 + "%", 
                    y: "-100%", 
                    height: `${Math.random() * 70 + 30}vh`,
                    opacity: 0.6
                  }}
                  animate={{ 
                    y: "200%",
                    opacity: [0.6, 0.8, 0.3]
                  }}
                  transition={{ 
                    duration: Math.random() * 5 + 3, 
                    ease: "linear",
                    times: [0, 0.5, 1]
                  }}
                  className="absolute w-px bg-gradient-to-b from-purple-500/30 via-pink-500/30 to-transparent"
                  style={{
                    left: `${i * 5}%`,
                    width: `${Math.random() * 2 + 1}px`
                  }}
                />
              ))}
            </motion.div>
          </div>
        );
        
      case 'circles':
        return (
          <div className={containerStyle}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={`circle-${i}`}
                  initial={{ 
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: 0,
                    opacity: 0.6
                  }}
                  animate={{ 
                    scale: Math.random() * 5 + 1,
                    opacity: [0.6, 0.3, 0]
                  }}
                  transition={{ 
                    duration: Math.random() * 4 + 2, 
                    ease: "easeOut"
                  }}
                  className="absolute rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-600/20 backdrop-blur-md"
                  style={{
                    width: `${Math.random() * 50 + 20}px`,
                    height: `${Math.random() * 50 + 20}px`
                  }}
                />
              ))}
            </motion.div>
          </div>
        );
        
      case 'galaxy':
        return (
          <div className={containerStyle}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-full h-full">
                {Array.from({ length: 50 }).map((_, i) => {
                  const angle = Math.random() * Math.PI * 2;
                  const distance = Math.random() * 40 + 10;
                  const size = Math.random() * 4 + 1;
                  const duration = Math.random() * 10 + 5;
                  
                  return (
                    <motion.div
                      key={`star-${i}`}
                      initial={{ 
                        x: '50%',
                        y: '50%',
                        scale: 0,
                        opacity: 0
                      }}
                      animate={{ 
                        x: `calc(50% + ${Math.cos(angle) * distance}%)`,
                        y: `calc(50% + ${Math.sin(angle) * distance}%)`,
                        scale: size / 10,
                        opacity: [0, 0.7, 0]
                      }}
                      transition={{ 
                        duration,
                        ease: "easeInOut",
                        times: [0, 0.2, 1]
                      }}
                      className="absolute rounded-full bg-white"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        boxShadow: `0 0 ${size * 2}px ${size/2}px rgba(255, 255, 255, 0.3)`
                      }}
                    />
                  );
                })}
              </div>
            </motion.div>
          </div>
        );
        
      case 'particles':
        return (
          <div className={containerStyle}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  initial={{ 
                    x: '50%',
                    y: '50%',
                    scale: 0,
                  }}
                  animate={{ 
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: Math.random() * 1 + 0.2,
                    opacity: [0, 0.8, 0]
                  }}
                  transition={{ 
                    duration: Math.random() * 5 + 2,
                    ease: "easeInOut",
                    times: [0, 0.4, 1]
                  }}
                  className="absolute rounded-full"
                  style={{
                    width: '8px',
                    height: '8px',
                    background: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 255)}, 0.6)`
                  }}
                />
              ))}
            </motion.div>
          </div>
        );
        
      case 'waves':
        return (
          <div className={containerStyle}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 overflow-hidden"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`wave-${i}`}
                  initial={{ 
                    scale: 0.2,
                    opacity: 0
                  }}
                  animate={{ 
                    scale: [0.2, 1.5],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{ 
                    duration: 6,
                    delay: i * 0.4,
                    ease: "easeOut",
                    repeat: 1,
                    repeatType: "reverse"
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    border: '2px solid rgba(147, 51, 234, 0.2)',
                    width: '100px',
                    height: '100px'
                  }}
                />
              ))}
            </motion.div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="dark"
      />
      
      {/* Visual Effects Layer - behind the player */}
      <AnimatePresence>
        {activeVisualEffect && !shouldHideVisualEffects() && renderVisualEffect()}
      </AnimatePresence>
      
      {/* Collapsed player icon - always fixed in bottom left corner */}
      <AnimatePresence>
        {!expanded && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed bottom-4 left-4 z-50 flex items-center gap-2"
          >
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <button 
              onClick={toggleExpanded}
              className="text-white text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg fixed bottom-4 left-4 z-50 max-w-xs border border-gray-700"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-white">Nhạc Nền</h3>
              <button 
                onClick={toggleExpanded} 
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Track info */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white truncate">
                {currentTrack?.title || "Không có bài hát nào"}
              </h4>
              <p className="text-xs text-gray-400 truncate">
                {currentTrack?.artist || "Không xác định"}
              </p>
            </div>
            
            {/* Seek bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{formatTime(seek)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 1}
                value={seek}
                onChange={handleSeekChange}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-500"
              />
            </div>
            
            {/* Playback controls */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={playPrevTrack}
                  disabled={tracks.length === 0}
                  className="text-white disabled:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                  </svg>
                </button>
                
                <button
                  onClick={togglePlay}
                  disabled={tracks.length === 0}
                  className="w-10 h-10 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 rounded-full flex items-center justify-center"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                )}
              </button>
              
              <button
                onClick={playNextTrack}
                disabled={tracks.length === 0}
                className="text-white disabled:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />                </svg>
              </button>
            </div>
          </div>
            
            {/* Shuffle button */}
            <button
              onClick={shuffleCurrentTracks}
              disabled={tracks.length <= 1}
              className="text-xs text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1 mt-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z" />
                <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z" />
              </svg>
              Xáo trộn
            </button>
            
            {/* Track list - show all tracks */}
            {tracks.length > 0 && (
              <div className="mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
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
            )}
            
            {/* Shuffle button - to manually shuffle tracks */}
            <div className="mt-4">
              <button
                onClick={shuffleCurrentTracks}
                className="w-full bg-purple-600 hover:bg-purple-500 rounded-lg py-2 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.293 9.293a1 1 0 011.414 0L10 13.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414z" />
                </svg>
                <span className="text-sm font-semibold">Xáo trộn bài hát</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
