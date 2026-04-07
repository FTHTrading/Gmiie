import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { BRAND } from "@xxxiii/config";
import "@xxxiii/ui/src/styles/globals.css";
import { ThemeProvider } from "@xxxiii/ui/src/components/ThemeProvider";
import { PlatformHeader } from "@/components/header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { SignalsPanel } from "@/components/signals/SignalsPanel";
import { MobileNav } from "@/components/navigation/MobileNav";
import { AudioProvider } from "@/components/audio/AudioContext";
import { GlobalAudioPlayer } from "@/components/audio/GlobalAudioPlayer";
import { getTrendingTopics, getTrendingEntities, getAggregateSignals, getCompositeIndex } from "@/lib/data";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.gmiie} - Global Monetary Infrastructure Intelligence Engine`,
    template: `%s | ${BRAND.gmiie}`,
  },
  description:
    "AI-powered intelligence platform tracking tokenized assets, financial infrastructure, regulation, and institutional blockchain adoption across global capital markets.",
  metadataBase: new URL("https://gmiie.xxxiii.io"),
};

export default async function GmiieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let trendingTopics: Awaited<ReturnType<typeof getTrendingTopics>> = [];
  let trendingEntities: Awaited<ReturnType<typeof getTrendingEntities>> = [];
  let aggregateSignals: Awaited<ReturnType<typeof getAggregateSignals>> = [];
  let compositeIndex: Awaited<ReturnType<typeof getCompositeIndex>> = null;

  try {
    const [tt, te, as_, ci] = await Promise.all([
      getTrendingTopics(),
      getTrendingEntities(),
      getAggregateSignals(),
      getCompositeIndex(),
    ]);
    trendingTopics = tt;
    trendingEntities = te;
    aggregateSignals = as_;
    compositeIndex = ci;
  } catch {
    // Database not connected - render shell with empty data
  }

  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body className="bg-background text-text-primary antialiased min-h-screen" suppressHydrationWarning>
        <ThemeProvider defaultTheme="dark" storageKey="gmiie-theme">
          <AudioProvider>
            <PlatformHeader />

            {/* pt-12 on mobile (no utility bar), pt-[76px] on md+ (utility bar + nav bar)
                pb-20 on lg to give the sticky GlobalAudioPlayer room */}
            <div className="pt-12 md:pt-[76px] pb-16 lg:pb-20 flex">
              <Sidebar />

              <main className="flex-1 min-w-0 px-4 lg:px-8 py-6">
                {children}
              </main>

              <SignalsPanel
                signals={aggregateSignals.length > 0 ? aggregateSignals : undefined}
                trendingTopics={trendingTopics.length > 0 ? trendingTopics : undefined}
                trendingEntities={trendingEntities.length > 0 ? trendingEntities : undefined}
                compositeIndex={compositeIndex}
              />
            </div>

            {/* Sticky audio player - sits above MobileNav (z-40) */}
            <GlobalAudioPlayer />
            <MobileNav />
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}