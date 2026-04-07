"use client";

/**
 * AudioContext — Global cross-page audio player state
 * ====================================================
 * Wraps the React tree with a persistent audio player that outlives
 * navigation. Attach <AudioProvider> once in layout.tsx; use
 * useAudio() anywhere in the tree.
 *
 * Plays MP3 streams from /api/narration/[articleId] via HTMLAudioElement.
 * Falls back gracefully: if the track fails to load, state is reset cleanly.
 */

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AudioTrack {
  /** The MP3 URL — typically /api/narration/[articleId] */
  url: string;
  /** Article headline or chain title — shown in the player */
  title: string;
  /** Source publication name (optional) */
  source?: string;
  /** Article ID for deduplication / active state detection */
  articleId?: string;
  /** Estimated duration in seconds (optional, shown before metadata loads) */
  durationEstimate?: number;
}

interface AudioContextValue {
  /** Currently loaded track (null = player hidden) */
  currentTrack: AudioTrack | null;
  /** True while audio is playing */
  isPlaying: boolean;
  /** True while the track is being fetched / decoded */
  isLoading: boolean;
  /** Playback progress 0–100 */
  progress: number;
  /** Duration in seconds (0 if not yet known) */
  duration: number;
  /** Playback speed multiplier */
  speed: number;
  /** Load + play a new track. If the same track is already loaded, toggles play/pause. */
  playTrack: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
}

// ── Context ────────────────────────────────────────────────────────────────

const AudioCtx = createContext<AudioContextValue | null>(null);

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used inside <AudioProvider>");
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────────────

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeedState] = useState(1);

  // Tear down existing audio element and remove all event listeners
  const teardown = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.src = "";
    el.load(); // reset srcless
    audioRef.current = null;
  }, []);

  const playTrack = useCallback(
    (track: AudioTrack) => {
      // Same track already loaded → toggle play/pause
      if (
        currentTrack?.articleId &&
        currentTrack.articleId === track.articleId &&
        audioRef.current
      ) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
        return;
      }

      // New track — tear down previous
      teardown();

      setCurrentTrack(track);
      setIsLoading(true);
      setIsPlaying(false);
      setProgress(0);
      setDuration(track.durationEstimate ?? 0);

      const el = new Audio(track.url);
      el.playbackRate = speed;
      el.preload = "auto";
      audioRef.current = el;

      const onCanPlay = () => {
        el.play().catch(() => {
          setIsLoading(false);
        });
      };

      const onPlaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      const onTimeUpdate = () => {
        if (el.duration && el.duration > 0) {
          setProgress((el.currentTime / el.duration) * 100);
          setDuration(el.duration);
        }
      };

      const onEnded = () => {
        setIsPlaying(false);
        setProgress(100);
      };

      const onError = () => {
        setIsLoading(false);
        setIsPlaying(false);
      };

      el.addEventListener("canplay", onCanPlay, { once: true });
      el.addEventListener("playing", onPlaying);
      el.addEventListener("timeupdate", onTimeUpdate);
      el.addEventListener("ended", onEnded);
      el.addEventListener("error", onError);

      el.load();
    },
    [currentTrack, isPlaying, speed, teardown],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    teardown();
    setCurrentTrack(null);
    setIsPlaying(false);
    setIsLoading(false);
    setProgress(0);
    setDuration(0);
  }, [teardown]);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else resume();
  }, [isPlaying, pause, resume]);

  const setSpeed = useCallback((s: number) => {
    setSpeedState(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  }, []);

  return (
    <AudioCtx.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        progress,
        duration,
        speed,
        playTrack,
        pause,
        resume,
        stop,
        togglePlay,
        setSpeed,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
}
