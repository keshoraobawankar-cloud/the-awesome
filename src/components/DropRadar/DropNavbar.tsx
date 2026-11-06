import React from 'react';
import { Search, Bell, Volume2, VolumeX, Sparkles, Film, Gamepad2, Tv, BookOpen, Layers } from 'lucide-react';
import { useBugle } from '../../context/BugleContext';

interface DropNavbarProps {
  onOpenSearch: () => void;
  onOpenWatchlist: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

export const DropNavbar: React.FC<DropNavbarProps> = ({
  onOpenSearch,
  onOpenWatchlist,
  selectedCategory,
  onSelectCategory,
  onScrollToSection
}) => {
  const { isAudioDeskEnabled, toggleAudioDesk, watchlistIds } = useBugle();

  const categories = [
    { label: 'All', icon: Layers, id: 'all' },
    { label: 'Movies', icon: Film, id: 'movies' },
    { label: 'Anime', icon: Sparkles, id: 'anime' },
    { label: 'Games', icon: Gamepad2, id: 'games' },
    { label: 'Dramas', icon: Tv, id: 'dramas' },
    { label: 'Books', icon: BookOpen, id: 'books' },
    { label: 'Manga', icon: Layers, id: 'manga' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0b0d1a]/85 border-b border-[#252846]/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => onScrollToSection('intro')}
            className="flex items-center gap-3 group text-left focus:outline-none"
            aria-label="DropRadar Home"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff3d71] via-[#8b5cf6] to-[#22d3ee] p-[2px] shadow-[0_0_15px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] transition-all">
              <div className="w-full h-full bg-[#0b0d1a] rounded-[10px] flex items-center justify-center">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff3d71]"></span>
                </span>
              </div>
            </div>
            <div>
              <div className="font-bebas text-2xl sm:text-3xl tracking-wider text-white flex items-center gap-1">
                DROP<span className="text-[#22d3ee]">RADAR</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#8b5cf6] font-inter font-semibold hidden sm:block -mt-1">
                Cinematic Release Tracker
              </p>
            </div>
          </button>

          {/* Center Category Filter Pills */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#121528]/80 p-1 rounded-full border border-[#252846]">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.label;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.label);
                    onScrollToSection('category-showcase');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-inter font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#ff3d71] to-[#8b5cf6] text-white shadow-[0_0_12px_rgba(255,61,113,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-[#252846]/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button with Cmd+K hint */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#171a30] hover:bg-[#202444] border border-[#2b3052] text-slate-300 hover:text-white text-xs sm:text-sm font-inter transition-all group"
              title="Search releases (Cmd/Ctrl + K)"
            >
              <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Search Drops...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#0b0d1a] border border-[#252846] rounded text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Audio Cue Desk Toggle */}
            <button
              onClick={toggleAudioDesk}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs sm:text-sm font-inter flex items-center gap-1.5 transition-all ${
                isAudioDeskEnabled
                  ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#22d3ee] shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                  : 'bg-[#171a30] border-[#2b3052] text-slate-400 hover:text-slate-200'
              }`}
              title={isAudioDeskEnabled ? 'Mute cinematic sound effects' : 'Enable cinematic sound effects'}
            >
              {isAudioDeskEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#22d3ee] animate-pulse" />
                  <span className="hidden sm:inline font-mono text-xs text-[#22d3ee]">AUDIO ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline font-mono text-xs">MUTED</span>
                </>
              )}
            </button>

            {/* Watchlist Drawer Button */}
            <button
              onClick={onOpenWatchlist}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-[#ff3d71] to-[#8b5cf6] text-white text-xs sm:text-sm font-inter font-semibold shadow-[0_0_15px_rgba(255,61,113,0.3)] hover:shadow-[0_0_20px_rgba(255,61,113,0.5)] transition-all flex items-center gap-1.5"
              aria-label="Open Tracked Drops Watchlist"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Tracked</span>
              {watchlistIds.length > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white text-[#ff3d71] ml-0.5">
                  {watchlistIds.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Category Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 -mx-4 px-4 scrollbar-none border-t border-[#252846]/40">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.label;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.label);
                  onScrollToSection('category-showcase');
                }}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-inter font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff3d71] to-[#8b5cf6] text-white'
                    : 'text-slate-400 bg-[#171a30] border border-[#2b3052]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
