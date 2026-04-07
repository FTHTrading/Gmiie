"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   LANGUAGE SELECTOR
   Compact dropdown — Bloomberg-discipline design system
   Persists selection in URL (?lang=) so all feed components
   downstream can read it without prop drilling.
   ═══════════════════════════════════════════════════════════════ */

export const SUPPORTED_LANGUAGES = [
  { code: "all", label: "All Languages", flag: "🌐" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ar", label: "العربية", flag: "🇦🇪" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang =
    (searchParams.get("lang") as LanguageCode) || "all";
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ?? SUPPORTED_LANGUAGES[0];

  const select = useCallback(
    (code: LanguageCode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (code === "all") {
        params.delete("lang");
      } else {
        params.set("lang", code);
      }
      const qs = params.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
      setIsOpen(false);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-1.5 h-7 px-2 rounded text-[11px] font-mono tracking-wide text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors border border-transparent hover:border-border-subtle"
        aria-label="Select language"
        title="Select language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden md:inline uppercase">{current.label}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-48 z-50 bg-surface border border-border-subtle rounded shadow-lg overflow-hidden">
            <div className="py-1 max-h-64 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => select(lang.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[11px] font-mono text-left hover:bg-surface-alt transition-colors ${
                    currentLang === lang.code
                      ? "text-gold bg-surface-alt"
                      : "text-text-secondary"
                  }`}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {currentLang === lang.code && (
                    <svg
                      className="ml-auto w-3 h-3 text-gold"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
