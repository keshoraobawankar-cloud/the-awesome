import React from 'react';
import { Search, Bell, BellRing, Sparkles, Film, Gamepad2, Tv, BookOpen, Layers, PlusCircle, Clapperboard, Coins } from 'lucide-react';
import { useBugle } from '../../context/BugleContext';
import { useNotifications } from '../../context/NotificationContext';
import { useDropData } from '../../context/DropDataContext';

interface DropNavbarProps {
  onOpenSearch: () => void;
  onOpenWatchlist: () => void;
  onOpenUserUpdates?: () => void;
  onOpenTokens?: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

export const DropNavbar: React.FC<DropNavbarProps> = ({
  onOpenSearch,
  onOpenWatchlist,
  onOpenUserUpdates,
  onOpenTokens,
  selectedCategory,
  onSelectCategory,
  onScrollToSection
}) => {
  const { watchlistIds } = useBugle();
  const { rules, unreadCount, setIsDrawerOpen } = useNotifications();
  const { myTokens } = useDropData();
  const activeAlertsCount = rules.filter((r) => r.enabled).length;

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
            aria-label="AheadOfYou Home"
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
              <span className="font-bebas text-2xl sm:text-3xl tracking-wider text-white">
                AHEAD<span className="text-[#22d3ee]">OFYOU</span>
              </span>
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
            <button
              onClick={() => {
                onSelectCategory('Movies');
                onScrollToSection('cinema-hub');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-inter font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
              title="Jump to Hollywood & Bollywood Movies"
            >
              <Clapperboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Cinema Hub</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Token Balance Button */}
            {onOpenTokens && (
              <button
                onClick={onOpenTokens}
                className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white text-xs sm:text-sm font-mono font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                title="Earn tokens by adding official trailers to releases"
                aria-label="Open Trailer Scout Tokens"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{myTokens}</span>
                <span className="hidden xl:inline text-[10px] text-amber-200/80 uppercase">Tokens</span>
              </button>
            )}

            {/* Submit Update Button ("user should give updates") */}
            {onOpenUserUpdates && (
              <button
                onClick={onOpenUserUpdates}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs sm:text-sm font-inter font-medium transition-all shadow-[0_0_12px_rgba(34,211,238,0.2)] group"
                title="Submit a release update, official trailer, date delay, or scoop"
              >
                <PlusCircle className="w-4 h-4 text-cyan-400 group-hover:rotate-90 transition-transform" />
                <span className="hidden sm:inline">Submit Update</span>
                <span className="sm:hidden">Update</span>
              </button>
            )}

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


            {/* Notification Center Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-[#171a30] hover:bg-[#202444] border border-cyan-500/40 text-cyan-300 hover:text-white text-xs sm:text-sm font-inter font-semibold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,211,238,0.18)]"
              aria-label="Open Notification Center"
              title="Set & manage notifications for any release, category, or news"
            >
              <BellRing className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Alerts</span>
              {(unreadCount > 0 || activeAlertsCount > 0) && (
                <span
                  className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full ml-0.5 ${
                    unreadCount > 0 ? 'bg-[#ff3d71] text-white' : 'bg-cyan-400 text-[#0b0d1a]'
                  }`}
                >
                  {unreadCount > 0 ? unreadCount : activeAlertsCount}
                </span>
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
          <button
            onClick={() => {
              onSelectCategory('Movies');
              onScrollToSection('cinema-hub');
            }}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-inter font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30"
          >
            <Clapperboard className="w-3 h-3 text-amber-400" />
            <span>Hollywood & Bollywood</span>
          </button>
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
