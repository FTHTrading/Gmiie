import { cn } from "../index";
import { BRAND, DOMAINS } from "@xxxiii/config";

export interface FooterProps {
  variant: "root" | "gmiie" | "lps" | "studio";
}

export function Footer({ variant }: FooterProps) {
  return (
    <footer className="border-t border-border-subtle bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="md:col-span-1">
            <span className="text-gold font-mono font-bold text-lg tracking-widest">
              XXXIII
            </span>
            <p className="mt-4 text-sm text-text-muted leading-relaxed">
              {BRAND.tagline}
            </p>
          </div>

          {/* Ecosystem */}
          <div>
            <h4 className="text-xs font-mono tracking-widest text-text-secondary uppercase mb-4">
              Ecosystem
            </h4>
            <ul className="space-y-2.5">
              <li><a href={`https://${DOMAINS.gmiie}`} className="text-sm text-text-muted hover:text-text-primary transition-colors">GMIIE Intelligence</a></li>
              <li><a href={`https://${DOMAINS.lps}`} className="text-sm text-text-muted hover:text-text-primary transition-colors">LPS-1 Protocol</a></li>
              <li><a href={`https://${DOMAINS.news}`} className="text-sm text-text-muted hover:text-text-primary transition-colors">News</a></li>
              <li><a href={`https://${DOMAINS.research}`} className="text-sm text-text-muted hover:text-text-primary transition-colors">Research</a></li>
              <li><a href={`https://${DOMAINS.signals}`} className="text-sm text-text-muted hover:text-text-primary transition-colors">Signals</a></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-mono tracking-widest text-text-secondary uppercase mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li><a href="/about" className="text-sm text-text-muted hover:text-text-primary transition-colors">About</a></li>
              <li><a href="/methodology" className="text-sm text-text-muted hover:text-text-primary transition-colors">Methodology</a></li>
              <li><a href="/contact" className="text-sm text-text-muted hover:text-text-primary transition-colors">Contact</a></li>
              <li><a href="https://github.com/xxxiii-io" className="text-sm text-text-muted hover:text-text-primary transition-colors">GitHub</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-mono tracking-widest text-text-secondary uppercase mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              <li><a href="/terms" className="text-sm text-text-muted hover:text-text-primary transition-colors">Terms</a></li>
              <li><a href="/privacy" className="text-sm text-text-muted hover:text-text-primary transition-colors">Privacy</a></li>
              <li><a href="/disclaimer" className="text-sm text-text-muted hover:text-text-primary transition-colors">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} XXXIII. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Intelligence is not financial advice. All content is for informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
