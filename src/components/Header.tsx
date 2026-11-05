import React, { useState, useEffect } from 'react';
import { Bookmark, Moon, Sun, Scroll, Flame, Camera, Mic, Volume2 } from 'lucide-react';
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

      {/* Top Bar Contract (§2) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark (Click 3x for Vigilante Easter Egg!) */}
        <button
          onClick={handleLogoClick}
          title="Click 3 times to trigger Spider-Man Web-Shooter Easter Egg!"
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded select-none relative"
        >
          <div className="bg-red-700 text-white font-headline text-2xl font-bold px-2 py-0.5 tracking-tighter shrink-0 uppercase rounded-sm group-hover:scale-105 transition-transform">
            THE
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-[#1c1917] dark:text-white uppercase whitespace-nowrap shrink-0 group-hover:text-red-700 dark:group-hover:text-red-500 transition-colors">
              DAILY BUGLE
            </span>
          </div>

          {/* Discreet click indicator prompt */}
          {logoClickCount > 0 && (
            <span className="absolute -bottom-4 left-0 text-[10px] font-sans font-bold text-red-600 dark:text-red-400 whitespace-nowrap animate-bounce">
              🕸️ Click {3 - logoClickCount} more time{3 - logoClickCount > 1 ? 's' : ''}...
            </span>
          )}
        </button>

        {/* Zone 2: 4-5 single-line clean text nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-sans font-medium text-[#57534e] dark:text-[#d6d3d1]">
          <button
            onClick={() => {
              setSelectedCategory('All');
              navigateTo('home');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-red-700 dark:hover:text-red-400 pb-0.5 ${
              activePage === 'home'
                ? 'text-[#1c1917] dark:text-white font-bold border-b-2 border-red-700'
                : ''
            }`}
          >
            Front Page
          </button>
          <button
            onClick={() => {
              setSelectedCategory('Opinion');
              navigateTo('home');
            }}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-red-700 dark:hover:text-red-400 pb-0.5"
          >
            Jameson's Desk
          </button>
          <button
            onClick={() => {
              setSelectedCategory('Crime & Justice');
              navigateTo('home');
            }}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-red-700 dark:hover:text-red-400 pb-0.5"
          >
            Crime Blotter
          </button>
          <button
            onClick={() => navigateTo('radar')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-red-700 dark:hover:text-red-400 pb-0.5 flex items-center gap-1.5 ${
              activePage === 'radar'
                ? 'text-[#1c1917] dark:text-white font-bold border-b-2 border-red-700'
                : 'text-red-700 dark:text-red-400 font-bold'
            }`}
          >
            <span>Release Radar</span>
            <span className="px-1.5 py-0.2 bg-red-100 dark:bg-red-950/60 rounded text-[10px] uppercase tracking-wider font-mono">
              DROPS
            </span>
          </button>
          <button
            onClick={() => setIsBountyModalOpen(true)}
            className="transition-colors whitespace-nowrap shrink-0 text-[#57534e] dark:text-[#a8a29e] hover:text-red-700 dark:hover:text-red-400 pb-0.5 flex items-center gap-1"
          >
            <Camera className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
            <span>Bounty Desk</span>
          </button>
          <button
            onClick={() => navigateTo('about')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-red-700 dark:hover:text-red-400 pb-0.5 ${
              activePage === 'about'
                ? 'text-[#1c1917] dark:text-white font-bold border-b-2 border-red-700'
                : ''
            }`}
          >
            About The Bugle
          </button>
        </nav>

        {/* Zone 3: 3-Way Theme Switcher (Light / Vintage Sepia / Dark) + Saved Stories Drawer Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Selector: Light / Vintage Sepia / Dark Mode */}
          <div className="flex items-center gap-0.5 bg-[#ede8df] dark:bg-[#1f1f23] rounded p-1 text-xs">
            <button
              onClick={() => setTheme('light')}
              aria-label="Modern Broadsheet Light Mode"
              title="Modern Broadsheet (Light)"
              className={`p-1.5 rounded transition-colors ${
                theme === 'light'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-[#78716c] dark:text-[#a8a29e] hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              aria-label="Vintage Newsprint Sepia Mode"
              title="Vintage Newsprint (1960s Sepia)"
              className={`p-1.5 rounded transition-colors ${
                theme === 'sepia'
                  ? 'bg-[#dfd4be] text-[#3d2b15] shadow-xs font-bold'
                  : 'text-[#78716c] dark:text-[#a8a29e] hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Scroll className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              aria-label="Midnight Edition Dark Mode"
              title="Midnight Press (Dark)"
              className={`p-1.5 rounded transition-colors ${
                theme === 'dark'
                  ? 'bg-[#2d2d34] text-amber-300 shadow-xs'
                  : 'text-[#78716c] dark:text-[#a8a29e] hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Saved Stories & Releases Manager Button (Opens Slide-over Drawer) */}
          <button
            onClick={() => setIsSavedDrawerOpen(true)}
            aria-label="Open Saved Dossier"
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded bg-red-700 text-white hover:bg-red-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
            title="Open Bookmarked Stories & Releases Drawer"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Bookmarks</span>
            <span className="px-1.5 py-0.2 bg-black/25 text-white rounded text-[11px] font-bold tabular-nums">
              {savedStoryIds.length + watchlistIds.length}
            </span>
          </button>
        </div>
      </div>

      {/* Breaking News Ticker Animation: Continuous Smooth Marquee */}
      <div className="border-t border-[#e7e2d9] dark:border-[#262629] bg-[#f5f1ea] dark:bg-[#18181c] py-2 px-4 sm:px-8 overflow-hidden group">
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden">
          {/* Pinned Flash Bulletin Kicker */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-500 uppercase tracking-wider shrink-0 bg-red-100 dark:bg-red-950/60 px-2.5 py-0.5 rounded shadow-xs z-10">
            <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>FLASH BULLETIN:</span>
          </div>

          {/* Smooth Continuous Marquee Banner */}
          <div className="overflow-hidden flex-1 relative">
            <div className="animate-marquee whitespace-nowrap text-xs font-sans text-[#44403c] dark:text-[#d6d3d1]">
              <span className="inline-block pr-12">
                🚨 Spider-Man sighted swinging near Queensboro Bridge overpass · ⚡ Oscorp Industries denies unauthorized bio-glider test flights · 💰 J. Jonah Jameson offers $10,000 cash for clear unmasked photos · 🏦 Bank vault heist suspects held at 14th Precinct · 🚇 Subway service fully restored on Broadway line after high-tensile webbing cleared · 📰 Daily Bugle Afternoon Edition hits newsstands at 2:00 PM
              </span>
              <span className="inline-block pr-12" aria-hidden="true">
                🚨 Spider-Man sighted swinging near Queensboro Bridge overpass · ⚡ Oscorp Industries denies unauthorized bio-glider test flights · 💰 J. Jonah Jameson offers $10,000 cash for clear unmasked photos · 🏦 Bank vault heist suspects held at 14th Precinct · 🚇 Subway service fully restored on Broadway line after high-tensile webbing cleared · 📰 Daily Bugle Afternoon Edition hits newsstands at 2:00 PM
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
