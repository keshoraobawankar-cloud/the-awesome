import React from 'react';
import { Bookmark, Moon, Sun, Newspaper, Flame, Search } from 'lucide-react';
import { useBugle } from '../context/BugleContext';

export const Header: React.FC = () => {
  const {
    activePage,
    navigateTo,
    savedStoryIds,
    theme,
    toggleTheme,
    setSelectedCategory
  } = useBugle();

  return (
    <header className="w-full bg-[#fcfaf7] dark:bg-[#111113] border-b border-[#e7e2d9] dark:border-[#262629] transition-colors duration-200">
      {/* Editorial Utility Bar: Date, Edition, City Weather */}
      <div className="border-b border-[#e7e2d9] dark:border-[#262629] text-[11px] font-sans tracking-wide text-[#78716c] dark:text-[#a8a29e] py-1 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-semibold text-red-700 dark:text-red-500 uppercase tracking-widest">FINAL CITY EDITION</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">VOL. LXXIV NO. 248</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span>FRIDAY, OCTOBER 30, 2026</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-right">
            <span className="hidden md:inline">MANHATTAN: 62°F · OVERCAST</span>
            <span aria-hidden="true" className="hidden md:inline">·</span>
            <span className="font-bold text-[#1c1917] dark:text-[#f3f4f6]">$1.50 NEWSSTAND</span>
          </div>
        </div>
      </div>

      {/* Top Bar Contract (§2) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded"
        >
          <div className="bg-red-700 text-white font-headline text-2xl font-bold px-2 py-0.5 tracking-tighter shrink-0 uppercase rounded-sm">
            THE
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-[#1c1917] dark:text-white uppercase whitespace-nowrap shrink-0 group-hover:text-red-700 dark:group-hover:text-red-500 transition-colors">
              DAILY BUGLE
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 single-line clean text nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-sans font-medium text-[#57534e] dark:text-[#d6d3d1]">
          <button
            onClick={() => navigateTo('home')}
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

        {/* Zone 3: 1 Primary Action + Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="p-2 text-[#57534e] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white hover:bg-[#ede8df] dark:hover:bg-[#1f1f23] rounded-md transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button
            onClick={() => navigateTo('saved')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
              activePage === 'saved'
                ? 'bg-red-700 text-white'
                : 'bg-[#ede8df] dark:bg-[#232328] text-[#1c1917] dark:text-[#f3f4f6] hover:bg-red-700 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Saved Stories</span>
            <span className="ml-1 px-1.5 py-0.2 bg-black/15 dark:bg-white/20 rounded text-[11px] tabular-nums">
              {savedStoryIds.length}
            </span>
          </button>
        </div>
      </div>

      {/* Breaking News Ticker */}
      <div className="border-t border-[#e7e2d9] dark:border-[#262629] bg-[#f5f1ea] dark:bg-[#18181c] py-2 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-500 uppercase tracking-wider shrink-0 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded">
            <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>FLASH BULLETIN:</span>
          </div>
          <div className="overflow-x-auto no-scrollbar text-xs font-sans text-[#44403c] dark:text-[#d6d3d1] whitespace-nowrap">
            <span>
              Spider-Man sighted near Queensboro Bridge · Oscorp denies unauthorized bio-glider test flights · J. Jonah Jameson offers $10,000 cash for clear unmasked photos · Bank vault suspects held at 14th Precinct
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
