import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { BRAND } from "@xxxiii/config";
import "@xxxiii/ui/src/styles/globals.css";

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
    default: `${BRAND.fullName} — ${BRAND.tagline}`,
    template: `%s | ${BRAND.fullName}`,
  },
  description: BRAND.description,
  metadataBase: new URL("https://xxxiii.io"),
  openGraph: {
    title: BRAND.fullName,
    description: BRAND.description,
    url: "https://xxxiii.io",
    siteName: BRAND.fullName,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.fullName,
    description: BRAND.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-background text-text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
