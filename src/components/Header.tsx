import React, { useState, useEffect } from 'react';
import { Bookmark, Moon, Sun, Scroll, Flame, Camera, Mic } from 'lucide-react';
import { useBugle, BugleTheme } from '../context/BugleContext';

export const Header: React.FC = () => {
  const {
    activePage,
    navigateTo,
    savedStoryIds,
    watchlistIds,
    theme,
    setTheme,
    cycleTheme,
    setSelectedCategory,
    setIsSavedDrawerOpen,
    setIsBountyModalOpen,
    setIsJJJRantOpen,
    triggerWebShooter
  } = useBugle();

  // Multi-click counter for Daily Bugle logo easter egg
  const [logoClickCount, setLogoClickCount] = useState(0);

  // Logo 3-click trigger
  const handleLogoClick = () => {
    const nextCount = logoClickCount + 1;
    if (nextCount >= 3) {
      setLogoClickCount(0);
      triggerWebShooter();
    } else {
      setLogoClickCount(nextCount);
      // Reset count if user stops clicking after 1.5 seconds
      setTimeout(() => setLogoClickCount(0), 1500);
    }
    navigateTo('home');
  };

  // Keyboard shortcut listener for Vigilante Easter Egg (Press 'W' or 'w')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'w' || e.key === 'W') {
        triggerWebShooter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerWebShooter]);

  return (
    <header className="w-full bg-[#fcfaf7] dark:bg-[#111113] border-b border-[#e7e2d9] dark:border-[#262629] transition-colors duration-200">
      {/* Editorial Utility Bar: Date, Edition, City Weather, and Easter Egg Shortcuts */}
      <div className="border-b border-[#e7e2d9] dark:border-[#262629] text-[11px] font-sans tracking-wide text-[#78716c] dark:text-[#a8a29e] py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-semibold text-red-700 dark:text-red-500 uppercase tracking-widest">
              FINAL CITY EDITION
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">VOL. LXXIV NO. 248</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>FRIDAY, OCTOBER 30, 2026</span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-right">
            {/* JJJ Rant Generator Quick Launcher */}
            <button
              onClick={() => setIsJJJRantOpen(true)}
              className="inline-flex items-center gap-1 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-bold uppercase tracking-wider transition-colors"
              title="Hear an angry editorial rant from J. Jonah Jameson"
            >
              <Mic className="w-3 h-3 text-red-600 animate-pulse" />
              <span>Jameson's Desk</span>
            </button>
            <span aria-hidden="true">·</span>

            {/* $10,000 Bounty Shortcut */}
            <button
              onClick={() => setIsBountyModalOpen(true)}
              className="inline-flex items-center gap-1 text-[#1c1917] dark:text-white hover:text-red-700 dark:hover:text-red-400 font-bold uppercase tracking-wider transition-colors"
              title="Submit photos to claim the $10,000 Bugle bounty"
            >
              <Camera className="w-3 h-3 text-red-700 dark:text-red-400" />
              <span>$10,000 Bounty</span>
            </button>
            <span aria-hidden="true" className="hidden md:inline">·</span>

            <span className="hidden md:inline font-bold text-[#1c1917] dark:text-[#f3f4f6]">
              $1.50 NEWSSTAND
            </span>
          </div>
        </div>
      </div>

      {/* Top Bar / Masthead */}
      <div className="max-w-[1180px] mx-auto px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
        {/* Zone 1: Brand Wordmark with Subtitle Date (Click 3x for Vigilante Easter Egg!) */}
        <div>
          <button
            onClick={handleLogoClick}
            title="Click 3 times to trigger Spider-Man Web-Shooter Easter Egg!"
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded select-none relative"
          >
            <span className="bg-[#c8102e] text-white font-anton text-2xl sm:text-3xl px-2 py-0.5 uppercase tracking-tighter shrink-0 rounded-xs group-hover:scale-105 transition-transform">
              THE
            </span>
            <span className="text-3xl sm:text-4xl font-anton font-normal tracking-tight text-[#12142a] dark:text-[#f4f2ea] uppercase whitespace-nowrap shrink-0 group-hover:text-[#c8102e] dark:group-hover:text-[#ff3b52] transition-colors">
              DAILY BUGLE
            </span>

            {/* Discreet click indicator prompt */}
            {logoClickCount > 0 && (
              <span className="absolute -bottom-4 left-0 text-[10px] font-ui font-bold text-red-600 dark:text-red-400 whitespace-nowrap animate-bounce">
                🕸️ Click {3 - logoClickCount} more time{3 - logoClickCount > 1 ? 's' : ''}...
              </span>
            )}
          </button>
          <div className="text-xs sm:text-sm font-ui font-medium text-[#555a75] dark:text-[#a3a8c4] mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Zone 3: Tools - Theme Switch & Saved Count Badge */}
        <div className="flex items-center gap-2.5 font-ui font-bold text-sm shrink-0">
          {/* Quick Jameson Hotline launcher */}
          <button
            onClick={() => setIsJJJRantOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-ui font-bold text-[#c8102e] dark:text-[#ff3b52] hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
            title="Hear an angry editorial rant from J. Jonah Jameson"
          >
            <Mic className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>JJJ Desk</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={cycleTheme}
            aria-label="Switch light, sepia, or dark theme"
            className="border-2 border-[#12142a] dark:border-[#f4f2ea] bg-transparent text-[#12142a] dark:text-[#f4f2ea] hover:bg-black/5 dark:hover:bg-white/10 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span>Light mode</span>
              </>
            ) : theme === 'sepia' ? (
              <>
                <Scroll className="w-3.5 h-3.5 text-amber-700" />
                <span>Dark mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span>Dark mode</span>
              </>
            )}
          </button>

          {/* Saved Bookmarks Button */}
          <button
            onClick={() => setIsSavedDrawerOpen(true)}
            aria-label="Open Saved Items"
            className="border-2 border-[#12142a] dark:border-[#f4f2ea] bg-[#12142a] dark:bg-[#f4f2ea] text-[#fcfaf7] dark:text-[#12142a] px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-transform active:scale-95 flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Saved</span>
            <span className="inline-block min-w-[20px] text-center bg-[#c8102e] text-white rounded-full text-[11px] font-bold px-1.5 py-0.2 ml-1 tabular-nums">
              {savedStoryIds.length + watchlistIds.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Section Navigation Bar (Matches Reference nav.main) */}
      <nav
        className="border-t-3 border-[#12142a] dark:border-[#2b3052] border-b border-[#cfd3e0] dark:border-[#2b3052] bg-white/40 dark:bg-[#151726]/40"
        aria-label="Sections"
      >
        <div className="max-w-[1180px] mx-auto px-5 py-2.5 flex items-center gap-6 overflow-x-auto no-scrollbar font-ui font-bold text-sm sm:text-base">
          <button
            onClick={() => navigateTo('radar')}
            aria-current={activePage === 'radar' ? 'page' : undefined}
            className={`pb-1 border-b-3 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activePage === 'radar'
                ? 'border-[#c8102e] text-[#c8102e] dark:text-[#ff3b52]'
                : 'border-transparent text-[#12142a] dark:text-[#f4f2ea] hover:text-[#c8102e]'
            }`}
          >
            Release Radar
          </button>

          <button
            onClick={() => {
              setSelectedCategory('All');
              navigateTo('home');
            }}
            aria-current={activePage === 'home' ? 'page' : undefined}
            className={`pb-1 border-b-3 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activePage === 'home'
                ? 'border-[#c8102e] text-[#c8102e] dark:text-[#ff3b52]'
                : 'border-transparent text-[#12142a] dark:text-[#f4f2ea] hover:text-[#c8102e]'
            }`}
          >
            Front page
          </button>

          <button
            onClick={() => {
              setSelectedCategory('Crime & Justice');
              navigateTo('home');
            }}
            className="pb-1 border-b-3 border-transparent text-[#12142a] dark:text-[#f4f2ea] hover:text-[#c8102e] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Latest stories
          </button>

          <button
            onClick={() => {
              setSelectedCategory('Opinion');
              navigateTo('home');
            }}
            className="pb-1 border-b-3 border-transparent text-[#12142a] dark:text-[#f4f2ea] hover:text-[#c8102e] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Opinion
          </button>

          <button
            onClick={() => setIsBountyModalOpen(true)}
            className="pb-1 border-b-3 border-transparent text-[#12142a] dark:text-[#f4f2ea] hover:text-[#c8102e] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-[#c8102e]" />
            <span>$10,000 Bounty</span>
          </button>

          <button
            onClick={() => navigateTo('about')}
            aria-current={activePage === 'about' ? 'page' : undefined}
            className={`pb-1 border-b-3 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activePage === 'about'
                ? 'border-[#c8102e] text-[#c8102e] dark:text-[#ff3b52]'
                : 'border-transparent text-[#12142a] dark:text-[#f4f2ea] hover:text-[#c8102e]'
            }`}
          >
            About The Bugle
          </button>
        </div>
      </nav>

      {/* Reference Flash Bulletins Ticker Bar */}
      <div className="bg-[#12142a] text-[#fcfaf7] dark:bg-[#0e1020] dark:text-[#f4f2ea] text-xs sm:text-sm font-ui flex items-center overflow-hidden border-b border-black/20" role="marquee" aria-label="Flash bulletins">
        <div className="bg-[#ffcf2e] text-[#12142a] font-black text-xs sm:text-sm px-4 py-2 shrink-0 z-10 uppercase tracking-widest flex items-center gap-1 shadow-sm">
          <span>FLASH</span>
        </div>
        <div className="overflow-hidden flex-1 relative py-2">
          <div className="animate-marquee whitespace-nowrap text-xs sm:text-sm font-medium tracking-wide flex items-center gap-12">
            {[
              'Release Desk confirms five drops this week',
              'Harbor Lights slips by three weeks',
              'Winter anime lineup is now final',
              'Skyline Runners 2 pre-orders are open',
              'Spider-Man sighted swinging near Queensboro Bridge overpass',
              'Oscorp Industries denies unauthorized bio-glider test flights',
              'J. Jonah Jameson offers $10,000 cash for clear unmasked photos',
              'Release Desk confirms five drops this week',
              'Harbor Lights slips by three weeks',
              'Winter anime lineup is now final',
              'Skyline Runners 2 pre-orders are open'
            ].map((f, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                <span>{f}</span>
                <span aria-hidden="true" className="text-[#ffcf2e]/60">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
