"use client";

/**
 * ScenarioListenButton
 * ====================
 * Inline Web Speech API listen button for scenario cascade chains.
 * Scenarios are static data (no DB article ID), so we drive TTS locally
 * rather than calling the AI narration API route.
 *
 * Assembles the chain's full text from the server and speaks it via
 * the browser's SpeechSynthesis API.
 */

import { useState, useRef, useCallback, useEffect } from "react";

interface ScenarioListenButtonProps {
  /** Pre-assembled narration text for the chain */
  narrationText: string;
  /** Approximate reading time for display */
  readingMins?: number;
}

export function ScenarioListenButton({
  narrationText,
  readingMins,
}: ScenarioListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const play = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();

    const ut = new SpeechSynthesisUtterance(narrationText);
    ut.rate = 0.92;
    ut.pitch = 1.0;

    // Prefer natural voices
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      for (const name of ["Google UK English Female", "Samantha", "Karen", "Google US English"]) {
        const v = voices.find((v) => v.name.includes(name));
        if (v) return v;
      }
      return voices.find((v) => v.lang.startsWith("en")) ?? null;
    };

    const voice = pickVoice();
    if (voice) ut.voice = voice;

    ut.onstart = () => { setIsPlaying(true); setIsPaused(false); };
    ut.onend = () => { setIsPlaying(false); setIsPaused(false); };
    ut.onerror = () => { setIsPlaying(false); setIsPaused(false); };
    ut.onpause = () => setIsPaused(true);
    ut.onresume = () => setIsPaused(false);

    window.speechSynthesis.speak(ut);
  }, [narrationText, isSupported]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  if (!isSupported) return null;

  const wordCount = narrationText.split(/\s+/).length;
  const mins = readingMins ?? Math.ceil(wordCount / 150);

  if (!isPlaying) {
    return (
      <button
        onClick={play}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-150 border text-caption font-mono font-medium bg-surface-elevated hover:bg-gold/5 border-border-subtle hover:border-gold/20 text-text-secondary hover:text-gold"
      >
        <span className="text-sm">▶</span>
        <span>Listen · ~{mins}m</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isPaused ? resume : pause}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gold/30 bg-gold/10 text-gold text-caption font-mono font-medium transition-all"
      >
        <span className="text-sm">{isPaused ? "▶" : "⏸"}</span>
        <span>{isPaused ? "Resume" : "Playing…"}</span>
      </button>
      <button
        onClick={stop}
        className="text-caption font-mono text-text-muted hover:text-red transition-colors px-1.5 py-1"
        title="Stop"
      >
        ■
      </button>
    </div>
  );
}

