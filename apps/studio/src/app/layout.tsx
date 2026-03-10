import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '@xxxiii/ui/src/styles/globals.css';
import { StudioSidebar } from './components/sidebar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: {
    default: 'XXXIII Studio — Command Center',
    template: '%s | XXXIII Studio',
  },
  description: 'Admin command center for the XXXIII intelligence ecosystem. Manage sources, content pipelines, AI prompts, taxonomy, and publishing automation.',
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} dark`}>
      <body className="font-sans bg-[#0A0A0F] text-white antialiased">
        <div className="flex min-h-screen">
          <StudioSidebar />
          <main className="flex-1 ml-64">
            <div className="border-b border-white/5 bg-surface/50 backdrop-blur-sm sticky top-0 z-30">
              <div className="flex items-center justify-between px-8 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/30 tracking-widest uppercase">XXXIII</span>
                  <span className="text-white/10">|</span>
                  <span className="text-xs font-mono text-gold/70 tracking-widest uppercase">Studio</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-white/40 font-mono">System Online</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-gold">A</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
