import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { BRAND } from "@xxxiii/config";
import "@xxxiii/ui/src/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${BRAND.lps} — ${BRAND.lpsTagline}`,
    template: `%s | ${BRAND.lps}`,
  },
  description: BRAND.lpsDescription,
  metadataBase: new URL("https://lps.xxxiii.io"),
};

export default function LpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-background text-text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
