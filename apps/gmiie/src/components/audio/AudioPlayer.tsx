"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   AUDIO PLAYER — Listen mode for articles
   Uses Web Speech API (SpeechSynthesis) for calm, human TTS.
   "Not first, but right" — the voice should be clear, calm,
   intelligent. Like a well-briefed analyst reading to you.
   ═══════════════════════════════════════════════════════════════ */

interface AudioPlayerProps {
  /** Text to speak — typically executive summary or full article */
  text: string;
  /** Title displayed in the player chrome */
  title: string;
  /** Whether this is a mini (inline) or full player */
  variant?: "mini" | "full";
  /** Called when playback starts */
  onPlay?: () => void;
  /** Called when playback ends */
  onEnd?: () => void;
}

export function AudioPlayer({
  text,
  title,
  variant = "mini",
  onPlay,
  onEnd,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const estimatedDurationRef = useRef<number>(0);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const getPreferredVoice = useCallback(() => {
    if (typeof window === "undefined") return null;
    const voices = window.speechSynthesis.getVoices();
    // Prefer natural-sounding English voices
    const preferred = [
      "Google UK English Female",
      "Google UK English Male",
      "Microsoft Zira",
      "Samantha",
      "Karen",
      "Daniel",
      "Google US English",
    ];
    for (const name of preferred) {
      const voice = voices.find((v) => v.name.includes(name));
      if (voice) return voice;
    }
    // Fallback to first English voice
    return voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
  }, []);

  const startProgress = useCallback((durationMs: number) => {
    startTimeRef.current = Date.now();
    estimatedDurationRef.current = durationMs;
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        if (progressInterval.current) clearInterval(progressInterval.current);
      }
    }, 200);
  }, []);

  const play = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to get a good voice (may need a tick for voices to load)
    const voice = getPreferredVoice();
    if (voice) utterance.voice = voice;

    // Estimate duration: ~150 words/minute at 0.95 rate
    const wordCount = text.split(/\s+/).length;
    const estimatedMs = (wordCount / 150) * 60 * 1000 / 0.95;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      startProgress(estimatedMs);
      onPlay?.();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      if (progressInterval.current) clearInterval(progressInterval.current);
      onEnd?.();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, isSupported, getPreferredVoice, startProgress, onPlay, onEnd]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    if (progressInterval.current) clearInterval(progressInterval.current);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
    // Resume progress tracking
    if (estimatedDurationRef.current > 0) {
      const remainingMs = estimatedDurationRef.current * (1 - progress / 100);
      startProgress(remainingMs);
    }
  }, [isSupported, progress, startProgress]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
  }, [isSupported]);

  const togglePlayPause = useCallback(() => {
    if (!isPlaying) {
      play();
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPlaying, isPaused, play, resume, pause]);

  if (!isSupported) return null;

  // Estimate reading time
  const wordCount = text.split(/\s+/).length;
  const readingMins = Math.ceil(wordCount / 150);

  if (variant === "mini") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePlayPause();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-elevated hover:bg-gold/10 border border-border-subtle hover:border-gold/30 transition-all duration-150 text-text-secondary hover:text-gold"
          title={isPlaying ? (isPaused ? "Resume" : "Pause") : "Listen"}
        >
          {/* Play/Pause icon */}
          <span className="text-sm">
            {isPlaying && !isPaused ? "⏸" : "▶"}
          </span>
          <span className="text-caption font-mono font-medium">
            {isPlaying ? (isPaused ? "Resume" : "Listening...") : `${readingMins}m`}
          </span>
        </button>
        {isPlaying && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              stop();
            }}
            className="text-caption text-text-muted hover:text-red transition-colors"
            title="Stop"
          >
            ■
          </button>
        )}
      </div>
    );
  }

  // Full player variant
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-caption font-mono text-text-muted uppercase tracking-wider mb-0.5">
            Listening
          </p>
          <p className="text-body-sm font-semibold text-text-primary truncate">
            {title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/30 flex items-center justify-center transition-all duration-150 text-gold"
          >
            <span className="text-lg">
              {isPlaying && !isPaused ? "⏸" : "▶"}
            </span>
          </button>
          {isPlaying && (
            <button
              onClick={stop}
              className="w-8 h-8 rounded-full bg-surface-elevated hover:bg-red/10 flex items-center justify-center transition-colors text-text-muted hover:text-red"
            >
              ■
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] font-mono text-text-muted">
          {isPlaying ? (isPaused ? "Paused" : "Playing") : `~${readingMins} min`}
        </span>
        <span className="text-[10px] font-mono text-text-muted">
          Web Speech API
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LISTEN BUTTON — Inline button for cards and article pages
   Shows "Listen" with estimated time. Expands to mini player.
   ═══════════════════════════════════════════════════════════════ */

interface ListenButtonProps {
  text: string;
  title: string;
  className?: string;
}

export function ListenButton({ text, title, className = "" }: ListenButtonProps) {
  return (
    <div className={className}>
      <AudioPlayer text={text} title={title} variant="mini" />
    </div>
  );
}
