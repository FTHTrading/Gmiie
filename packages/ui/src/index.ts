// ═══════════════════════════════════════════════════════════════
// @xxxiii/ui — Design System Utilities
// ═══════════════════════════════════════════════════════════════

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export all components
export * from "./components/Button";
export * from "./components/Card";
export * from "./components/Badge";
export * from "./components/Container";
export * from "./components/Header";
export * from "./components/Footer";
export * from "./components/SignalScore";
export * from "./components/EntityChip";
export * from "./components/IntelligenceCard";
export * from "./components/TopicBadge";
export * from "./components/MetadataBlock";
export { ThemeProvider, ThemeToggle, useTheme } from "./components/ThemeProvider";
