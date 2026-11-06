import React from 'react';
import { ArrowUp, Sparkles, Radio, Shield, Heart } from 'lucide-react';

interface DropFooterProps {
  onScrollToTop: () => void;
  onScrollToSection: (id: string) => void;
}

export const DropFooter: React.FC<DropFooterProps> = ({ onScrollToTop, onScrollToSection }) => {
  return (
    <footer className="relative w-full bg-[#070812] border-t border-[#252846] py-16 sm:py-20 text-slate-400 font-inter overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff3d71] via-[#8b5cf6] to-[#22d3ee] flex items-center justify-center p-[1px]">
                <div className="w-full h-full bg-[#0b0d1a] rounded-[7px] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                </div>
              </div>
              <span className="font-bebas text-2xl text-white tracking-wider">
                TICK<span className="text-[#22d3ee]">ORA</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              The scroll-driven live tracker for the biggest upcoming drops across movies, anime, games, dramas, books, and manga.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>TICKORA SYSTEM ONLINE</span>
            </div>
          </div>

          {/* Sectors */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold mb-4">
              Release Sectors
            </h4>
            <ul className="space-y-2 text-xs">
              {['Movies & IMAX', 'Anime Simulcasts', 'Gaming Launches', 'TV Dramas', 'Books & Novels', 'Manga Tankōbon'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => onScrollToSection('category-showcase')}
                    className="hover:text-white hover:underline transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Jumps */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold mb-4">
              Radar Trajectory
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onScrollToSection('hero-countdown')}
                  className="hover:text-white transition-colors"
                >
                  Hero Countdown Clock
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('timeline')}
                  className="hover:text-white transition-colors"
                >
                  This Week Timeline
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('poster-gallery')}
                  className="hover:text-white transition-colors"
                >
                  Poster Parallax Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('news-section')}
                  className="hover:text-white transition-colors"
                >
                  Breaking News Stack
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('reminders')}
                  className="hover:text-white transition-colors"
                >
                  Drop Alerts Dispatch
                </button>
              </li>
            </ul>
          </div>

          {/* Back to Top Button & System Note */}
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold mb-4">
                Telemetry
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Timestamps calculated in real-time according to confirmed distribution lock dates.
              </p>
            </div>

            <button
              onClick={onScrollToTop}
              className="p-3.5 rounded-2xl bg-[#171a30] hover:bg-[#252846] border border-[#2b3052] text-white flex items-center justify-between text-xs font-mono uppercase tracking-wider transition-all hover:border-cyan-400 group"
            >
              <span>Back To Top</span>
              <div className="w-6 h-6 rounded-lg bg-cyan-400/20 text-cyan-300 flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                <ArrowUp className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Bar & Legal Attributions */}
        <div className="pt-8 border-t border-[#252846]/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="space-y-1 text-center md:text-left">
            <p>© 2026 Tickora. Built with live countdown telemetry.</p>
            <p className="text-[11px] text-slate-500">
              This product uses the TMDB API but is not endorsed or certified by TMDB. Anime & manga metadata powered by AniList GraphQL.
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by GSAP + Lenis + Motion</span>
            <span>•</span>
            <span className="text-cyan-400">Real-Time Sync Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
