"use client";

import { useCallback } from "react";
import { useAudio } from "./AudioContext";
import type { ArticleDetail } from "@/lib/models";

interface ArticleListenPlayerProps {
  article: ArticleDetail;
}

export function ArticleListenPlayer({ article }: ArticleListenPlayerProps) {
  const { playTrack, currentTrack, isPlaying, isLoading, togglePlay, progress } = useAudio();

  const isActive = currentTrack?.articleId === article.slug;
  const showLoading = isActive && isLoading;
  const showPlaying = isActive && isPlaying;

  const handleListen = useCallback(() => {
    playTrack({
      url: `/api/narration/${article.slug}?voice=shimmer`,
      title: article.headline ?? article.title,
      articleId: article.slug,
      durationEstimate: 165,
    });
  }, [article, playTrack]);

  const handleClick = useCallback(() => {
    if (isActive) {
      togglePlay();
    } else {
      handleListen();
    }
  }, [isActive, togglePlay, handleListen]);

  return (
    <div className="mb-6 sm:mb-8 bg-surface rounded-xl border border-border-subtle p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-caption font-mono text-text-muted uppercase tracking-wider mb-0.5">
            AI Narration
          </p>
          <p className="text-body-sm font-semibold text-text-primary truncate">
            {article.headline ?? article.title}
          </p>
          <p className="text-caption text-text-muted mt-0.5">
            {showLoading
              ? "Generating analyst narration…"
              : showPlaying
                ? "Playing via global player"
                : "OpenAI TTS · shimmer voice · ~3 min"}
          </p>
        </div>

        <button
          onClick={handleClick}
          disabled={showLoading}
          className={[
            "shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 border",
            isActive
              ? "bg-gold/15 border-gold/40 text-gold"
              : "bg-gold/10 hover:bg-gold/20 border-gold/30 text-gold",
          ].join(" ")}
          aria-label={showPlaying ? "Pause" : "Play narration"}
        >
          {showLoading ? (
            <span className="w-5 h-5 border-2 border-gold/40 border-t-gold rounded-full animate-spin" />
          ) : showPlaying ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}
        </button>
      </div>

      {/* Progress indicator — only shown when this track is active */}
      {isActive && (
        <div className="mt-3 h-0.5 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-300"
            style={{ width: `${isActive ? progress : 0}%` }}
          />
        </div>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 ml-0.5">
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M6.75 5.25a.75.75 0 00-.75.75V14a.75.75 0 001.5 0V6a.75.75 0 00-.75-.75zm6.5 0a.75.75 0 00-.75.75V14a.75.75 0 001.5 0V6a.75.75 0 00-.75-.75z"
        clipRule="evenodd"
      />
    </svg>
  );
}

