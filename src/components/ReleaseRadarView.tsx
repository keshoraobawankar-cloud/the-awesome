import React, { useState, useMemo } from 'react';
import {
  Film,
  Sparkles,
  Gamepad2,
  Tv,
  BookOpen,
  FileText,
  Calendar,
  Search,
  Bell,
  Check,
  Flame,
  LayoutGrid,
  X,
  Play
} from 'lucide-react';
import { ENTERTAINMENT_RELEASES, ReleaseItem } from '../data/releases';
import { useBugle } from '../context/BugleContext';
import { ReleaseCard } from './ReleaseCard';
import { CountdownClock } from './CountdownClock';
import { ExcerptReaderModal } from './ExcerptReaderModal';

type CategoryFilter = 'All' | 'Movies' | 'Anime' | 'Gaming' | 'TV Dramas' | 'Books & Novels' | 'Entertainment News' | 'Watchlist';

export const ReleaseRadarView: React.FC = () => {
  const {
    watchlistIds,
    toggleWatchlist,
    isWatchlisted,
  } = useBugle();

  const [activeTab, setActiveTab] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ReleaseItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Coming Soon' | 'Out Now' | 'Breaking'>('All');

  // Spotlight item for Hero Live Countdown
  const spotlightItem = useMemo(() => {
    if (activeTab === 'Watchlist') {
      const saved = ENTERTAINMENT_RELEASES.filter((r) => watchlistIds.includes(r.id));
      return saved[0] || ENTERTAINMENT_RELEASES[0];
    }
    if (activeTab === 'All') {
      return ENTERTAINMENT_RELEASES[0]; // GTA VI
    }
    const catItems = ENTERTAINMENT_RELEASES.filter((r) => r.category === activeTab);
    return catItems[0] || ENTERTAINMENT_RELEASES[0];
  }, [activeTab, watchlistIds]);

  // Filtered releases
  const filteredReleases = useMemo(() => {
    return ENTERTAINMENT_RELEASES.filter((item) => {
      // Category / Watchlist Tab
      if (activeTab === 'Watchlist') {
        if (!watchlistIds.includes(item.id)) return false;
      } else if (activeTab !== 'All' && item.category !== activeTab) {
        return false;
      }

      // Status Filter
      if (statusFilter !== 'All' && item.status !== statusFilter) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          item.title.toLowerCase().includes(q) ||
          item.platform.toLowerCase().includes(q) ||
          (item.creatorOrAuthor && item.creatorOrAuthor.toLowerCase().includes(q)) ||
          item.description.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      return true;
    }).sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
  }, [activeTab, statusFilter, searchQuery, watchlistIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
      {/* Header Breadcrumb */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5dfd5] dark:border-[#262629] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-red-700 dark:text-red-400 mb-1">
            <span>THE DAILY BUGLE POP CULTURE WIRE</span>
            <span aria-hidden="true" className="text-[#a8a29e]">·</span>
            <span className="text-[#78716c] dark:text-[#a8a29e] font-normal">ENTERTAINMENT & LITERARY DESK</span>
          </div>
          <h1 className="font-serif-display font-black text-3xl sm:text-4xl text-[#1c1917] dark:text-white uppercase tracking-tight">
            Release Radar: Movies, Anime, Games, TV & Books
          </h1>
          <p className="text-xs sm:text-sm font-sans text-[#57534e] dark:text-[#a8a29e] mt-1">
            Live ticking countdowns, confirmed drop windows, chapter excerpts, and breaking entertainment wire reports.
          </p>
        </div>

        {/* Watchlist Quick Launch Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('Watchlist')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-sans font-bold rounded transition-colors shadow-xs ${
              activeTab === 'Watchlist'
                ? 'bg-red-700 text-white'
                : 'bg-[#ede8df] dark:bg-[#1f1f23] text-[#1c1917] dark:text-[#f3f4f6] hover:bg-red-700 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>My Release Watchlist</span>
            <span className="px-1.5 py-0.2 bg-black/20 text-white rounded text-[11px] font-bold tabular-nums">
              {watchlistIds.length}
            </span>
          </button>
        </div>
      </div>

      {/* Hero Spotlight: Featured Drop with Live Ticking Countdown */}
      {spotlightItem && (
        <div
          className={`mb-10 rounded overflow-hidden bg-gradient-to-r ${spotlightItem.themeColor || 'from-red-800 to-stone-900'} text-white shadow-xl border border-black/20 relative`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
            {/* Left: Info */}
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-xs font-headline uppercase tracking-widest text-white/90 mb-2">
                <span className="bg-black/50 backdrop-blur-xs px-2.5 py-0.5 rounded font-bold">
                  🔥 SPOTLIGHT {activeTab === 'All' ? 'RELEASE' : activeTab.toUpperCase()}
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded font-bold">
                  {spotlightItem.status}
                </span>
              </div>

              <h2 className="font-serif-display font-black text-3xl sm:text-5xl text-white leading-tight mb-2">
                {spotlightItem.title}
              </h2>

              {spotlightItem.creatorOrAuthor && (
                <div className="text-xs font-sans text-amber-200 mb-3 font-semibold">
                  By {spotlightItem.creatorOrAuthor} · {spotlightItem.platform}
                </div>
              )}

              <p className="font-editorial text-base sm:text-lg text-white/90 leading-relaxed mb-6 line-clamp-3">
                {spotlightItem.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setSelectedItem(spotlightItem)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-stone-900 hover:bg-amber-100 rounded text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {spotlightItem.category === 'Books & Novels' ? 'Read Chapter Excerpt' : 'Full Intel & Coverage'}
                  </span>
                </button>

                <button
                  onClick={() => toggleWatchlist(spotlightItem.id, spotlightItem.title)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded text-xs font-sans font-bold uppercase tracking-wider transition-colors ${
                    isWatchlisted(spotlightItem.id)
                      ? 'bg-red-700 text-white'
                      : 'bg-black/40 hover:bg-black/60 text-white border border-white/20'
                  }`}
                >
                  {isWatchlisted(spotlightItem.id) ? <Check className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  <span>{isWatchlisted(spotlightItem.id) ? 'Saved in Watchlist' : 'Set Release Reminder'}</span>
                </button>
              </div>
            </div>

            {/* Right: Ticking Countdown Card */}
            <div className="bg-black/60 backdrop-blur-md p-6 rounded border border-white/20 lg:w-96 text-center">
              <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-amber-300 mb-1">
                COUNTDOWN TO DROP DATE
              </div>
              <div className="font-serif-display font-bold text-xl text-white mb-4">
                {spotlightItem.releaseDate}
              </div>

              {/* Live Ticking Clock */}
              <CountdownClock targetDate={spotlightItem.releaseDate} />

              <div className="mt-4 pt-3 border-t border-white/10 text-xs font-sans text-white/80">
                Distribution verified on: {spotlightItem.platform}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Content Categories & Tabs Navigation Bar */}
      <div className="mb-6 border-b-2 border-[#1c1917] dark:border-[#262629] pb-1">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('All')}
            className={`px-3.5 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 rounded-t ${
              activeTab === 'All'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-[#57534e] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white hover:bg-[#ede8df] dark:hover:bg-[#1a1a1f]'
            }`}
          >
            🌟 All Drops ({ENTERTAINMENT_RELEASES.length})
          </button>

          <button
            onClick={() => setActiveTab('Movies')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 rounded-t ${
              activeTab === 'Movies'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-[#57534e] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white hover:bg-[#ede8df] dark:hover:bg-[#1a1a1f]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Blockbuster Movies</span>
          </button>

          <button
            onClick={() => setActiveTab('Anime')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 rounded-t ${
              activeTab === 'Anime'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-[#57534e] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white hover:bg-[#ede8df] dark:hover:bg-[#1a1a1f]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Anime Premieres</span>
          </button>

          <button
            onClick={() => setActiveTab('Gaming')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 rounded-t ${
              activeTab === 'Gaming'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-[#57534e] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white hover:bg-[#ede8df] dark:hover:bg-[#1a1a1f]'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Video Game Launches</span>
          </button>

          <button
            onClick={() => setActiveTab('TV Dramas')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 rounded-t ${
              activeTab === 'TV Dramas'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-[#57534e] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white hover:bg-[#ede8df] dark:hover:bg-[#1a1a1f]'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>TV & Dramas</span>
          </button>

          <button
            onClick={() => setActiveTab('Books & Novels')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 rounded-t ${
              activeTab === 'Books & Novels'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-[#57534e] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white hover:bg-[#ede8df] dark:hover:bg-[#1a1a1f]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Books & Novels Desk</span>
          </button>

          <button
            onClick={() => setActiveTab('Entertainment News')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 rounded-t ${
              activeTab === 'Entertainment News'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-[#57534e] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white hover:bg-[#ede8df] dark:hover:bg-[#1a1a1f]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>The Pop Culture Wire</span>
          </button>

          <button
            onClick={() => setActiveTab('Watchlist')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 rounded-t ${
              activeTab === 'Watchlist'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-[#57534e] dark:text-[#a8a29e] hover:text-[#1c1917] dark:hover:text-white hover:bg-[#ede8df] dark:hover:bg-[#1a1a1f]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>My Watchlist ({watchlistIds.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716c] dark:text-[#a8a29e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search GTA VI, Demon Slayer, Faerie novel, studio, author..."
              className="w-full pl-10 pr-10 py-2 bg-white dark:bg-[#18181c] border border-[#d6cfc2] dark:border-[#2d2d34] rounded text-xs sm:text-sm text-[#1c1917] dark:text-white placeholder-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-red-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#1c1917]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-[#ede8df] dark:bg-[#1a1a1e] rounded text-xs self-start sm:self-auto">
            <span className="text-[11px] font-bold text-[#78716c] dark:text-[#a8a29e] px-2">Status:</span>
            {(['All', 'Confirmed', 'Coming Soon', 'Out Now', 'Breaking'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white dark:bg-[#2c2c33] text-[#1c1917] dark:text-white shadow-xs font-bold'
                    : 'text-[#78716c] dark:text-[#a8a29e] hover:text-[#1c1917]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Status Counter */}
        <div className="text-xs font-sans text-[#78716c] dark:text-[#a8a29e] flex items-center justify-between">
          <div>
            Showing <strong className="text-[#1c1917] dark:text-white tabular-nums">{filteredReleases.length}</strong> releases
            {activeTab !== 'All' && <span> in <strong>{activeTab}</strong></span>}
            {searchQuery && <span> matching <strong>"{searchQuery}"</strong></span>}
          </div>
          <span className="hidden sm:inline">Daily Bugle Entertainment Wire</span>
        </div>
      </div>

      {/* Grid of Release Cards */}
      {filteredReleases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReleases.map((item) => (
            <ReleaseCard
              key={item.id}
              item={item}
              onSelect={(selected) => setSelectedItem(selected)}
              isBookmarked={isWatchlisted(item.id)}
              onToggleBookmark={(id, title) => toggleWatchlist(id, title)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-[#18181c] border border-[#e5dfd5] dark:border-[#262629] rounded">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#f5f1ea] dark:bg-[#202025] flex items-center justify-center text-[#78716c] dark:text-[#a8a29e]">
            <Search className="w-6 h-6 text-red-700 dark:text-red-400" />
          </div>
          <h3 className="font-serif-display font-bold text-xl text-[#1c1917] dark:text-white">
            {activeTab === 'Watchlist' ? 'Your Release Watchlist is Empty' : 'No Releases Found'}
          </h3>
          <p className="text-xs sm:text-sm font-sans text-[#78716c] dark:text-[#a8a29e] mt-2 mb-6 max-w-md mx-auto leading-relaxed">
            {activeTab === 'Watchlist'
              ? 'Click the bookmark bell icon on any movie, anime, game, TV drama, or novel to save it to your personal drop calendar.'
              : 'Try clearing your search keyword or switching between category tabs.'}
          </p>
          <button
            onClick={() => {
              setActiveTab('All');
              setStatusFilter('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-sans font-bold uppercase tracking-wider rounded transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Interactive Excerpt & Article Reader Modal */}
      <ExcerptReaderModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};
